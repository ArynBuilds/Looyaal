-- ============================================================
-- Looyaal — Baseline Migration
-- Supabase (PostgreSQL 17) with Row Level Security
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- FUNCTIONS
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_user_org_id()
 RETURNS uuid
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
AS $function$
BEGIN
    RETURN (SELECT org_id FROM public.users WHERE id = auth.uid());
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  org_name TEXT;
  org_slug TEXT;
  org_id UUID;
  final_slug TEXT;
  existing_slug UUID;
BEGIN
  org_name := NEW.raw_user_meta_data ->> 'org_name';

  IF org_name IS NULL OR org_name = '' THEN
    RETURN NEW;
  END IF;

  org_slug := lower(regexp_replace(regexp_replace(org_name, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'));

  SELECT id INTO existing_slug FROM public.organizations WHERE slug = org_slug;
  IF existing_slug IS NOT NULL THEN
    final_slug := org_slug || '-' || floor(extract(epoch from now()))::text;
  ELSE
    final_slug := org_slug;
  END IF;

  INSERT INTO public.organizations (name, slug, email)
  VALUES (org_name, final_slug, NEW.email)
  RETURNING id INTO org_id;

  INSERT INTO public.users (id, org_id, email, full_name, role)
  VALUES (
    NEW.id,
    org_id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    'owner'
  );

  INSERT INTO public.loyalty_programs (org_id, name, type, stamps_required)
  VALUES (org_id, 'Sadakat Kartı', 'stamp', 10);

  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.compute_rfm_segments()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  WITH rfm_data AS (
    SELECT
      c.id AS customer_id,
      c.org_id,
      EXTRACT(DAY FROM NOW() - MAX(v.visited_at))::INTEGER AS recency_days,
      COUNT(v.id)::INTEGER AS frequency,
      COALESCE(SUM(v.amount), 0)::NUMERIC AS monetary
    FROM customers c
    LEFT JOIN visits v ON v.customer_id = c.id AND v.visited_at > NOW() - INTERVAL '180 days'
    GROUP BY c.id, c.org_id
    HAVING COUNT(v.id) > 0
  ),
  rfm_scored AS (
    SELECT
      customer_id,
      org_id,
      NTILE(5) OVER (PARTITION BY org_id ORDER BY recency_days DESC) AS r_score,
      NTILE(5) OVER (PARTITION BY org_id ORDER BY frequency ASC) AS f_score,
      NTILE(5) OVER (PARTITION BY org_id ORDER BY monetary ASC) AS m_score
    FROM rfm_data
  )
  UPDATE customers SET
    rfm_score = rs.r_score::TEXT || rs.f_score::TEXT || rs.m_score::TEXT,
    rfm_segment = CASE
      WHEN rs.r_score >= 4 AND rs.f_score >= 4 THEN 'champion'
      WHEN rs.r_score >= 3 AND rs.f_score >= 3 THEN 'loyal'
      WHEN rs.r_score >= 4 AND rs.f_score <= 2 THEN 'new'
      WHEN rs.r_score <= 2 AND rs.f_score >= 3 THEN 'at_risk'
      WHEN rs.r_score <= 2 AND rs.f_score <= 2 THEN 'lost'
      WHEN rs.r_score >= 3 AND rs.f_score <= 2 THEN 'promising'
      ELSE 'needs_attention'
    END,
    updated_at = NOW()
  FROM rfm_scored rs
  WHERE customers.id = rs.customer_id;
END;
$function$;

-- ============================================================
-- TABLES
-- ============================================================

-- Organizations: The coffee shop brand/company
CREATE TABLE public.organizations (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    name text NOT NULL,
    slug text NOT NULL,
    logo_url text,
    primary_color text DEFAULT '#8B4513'::text,
    phone text,
    email text,
    tax_id text,
    address text,
    city text,
    country text DEFAULT 'TR'::text,
    onboarding_completed boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    pwa_theme text DEFAULT 'dark_card'::text,
    quiet_hours_start time without time zone DEFAULT '09:00'::time,
    quiet_hours_end time without time zone DEFAULT '21:00'::time,
    max_notifications_per_week integer DEFAULT 3,
    social_links jsonb DEFAULT '{}'::jsonb,
    source_url text,
    mood text DEFAULT 'premium'::text,
    brand_extracted_at timestamp with time zone,
    banner_url text,
    hero_layout text DEFAULT 'banner'::text,
    loyalty_display text DEFAULT 'grid'::text,
    campaign_layout text DEFAULT 'gallery'::text,
    stamp_shape text DEFAULT 'rounded-full'::text,
    font_weight text DEFAULT '800'::text,
    tracking text DEFAULT '-0.02em'::text,
    name_case text DEFAULT 'none'::text,
    card_bg text DEFAULT 'gradient'::text,
    border_width text DEFAULT '1'::text,
    bar_style text DEFAULT 'gradient'::text,
    gradient_intensity text DEFAULT 'medium'::text,
    icon_style text DEFAULT 'outlined'::text,
    animation_speed text DEFAULT 'normal'::text,
    tab_indicator text DEFAULT 'underline'::text,
    bg_style text DEFAULT 'deep'::text,
    structure text DEFAULT 'card-stack'::text,
    nav_type text DEFAULT 'bottom-bar'::text,
    type_scale text DEFAULT 'loud'::text,
    focal_point text DEFAULT 'progress-ring'::text,
    theme_overrides jsonb DEFAULT '{}'::jsonb,
    pwa_config jsonb DEFAULT '{}'::jsonb,
    CONSTRAINT organizations_pkey PRIMARY KEY (id),
    CONSTRAINT organizations_slug_key UNIQUE (slug)
);

-- Locations: Physical shop locations
CREATE TABLE public.locations (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    org_id uuid NOT NULL,
    name text NOT NULL,
    address text,
    city text,
    district text,
    latitude numeric,
    longitude numeric,
    phone text,
    google_place_id text,
    timezone text DEFAULT 'Europe/Istanbul'::text,
    opening_time time without time zone DEFAULT '07:00'::time,
    closing_time time without time zone DEFAULT '23:00'::time,
    pos_type text,
    pos_api_key text,
    pos_location_id text,
    qr_code_url text,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    has_pos boolean DEFAULT false,
    gps_verification boolean DEFAULT true,
    pending_removal boolean DEFAULT false,
    removal_effective_at timestamp with time zone,
    is_primary boolean DEFAULT false,
    CONSTRAINT locations_pkey PRIMARY KEY (id),
    CONSTRAINT locations_org_id_fkey FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE
);

-- Users: Dashboard users (owners, managers, baristas)
CREATE TABLE public.users (
    id uuid NOT NULL,
    org_id uuid,
    email text NOT NULL,
    full_name text,
    phone text,
    role text NOT NULL DEFAULT 'owner'::text,
    assigned_locations uuid[] DEFAULT '{}'::uuid[],
    avatar_url text,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT users_pkey PRIMARY KEY (id),
    CONSTRAINT users_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE,
    CONSTRAINT users_org_id_fkey FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE SET NULL
);

-- Customers: End consumers who visit the coffee shop
CREATE TABLE public.customers (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    org_id uuid NOT NULL,
    phone text NOT NULL,
    full_name text,
    email text,
    birth_date date,
    gender text,
    preferred_language text DEFAULT 'tr'::text,
    whatsapp_opted_in boolean DEFAULT false,
    sms_opted_in boolean DEFAULT false,
    push_opted_in boolean DEFAULT false,
    push_subscription jsonb,
    first_visit_at timestamp with time zone,
    last_visit_at timestamp with time zone,
    total_visits integer DEFAULT 0,
    total_spent numeric DEFAULT 0,
    rfm_segment text,
    rfm_score text,
    churn_risk numeric,
    churn_risk_updated_at timestamp with time zone,
    tags text[] DEFAULT '{}'::text[],
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    primary_location_id uuid,
    top_items jsonb DEFAULT '[]'::jsonb,
    preferred_visit_hour smallint,
    preferred_visit_day smallint,
    avg_spend numeric,
    optimal_discount numeric,
    notification_clicks integer DEFAULT 0,
    notification_ignores integer DEFAULT 0,
    CONSTRAINT customers_pkey PRIMARY KEY (id),
    CONSTRAINT customers_org_id_phone_key UNIQUE (org_id, phone),
    CONSTRAINT customers_org_id_fkey FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE,
    CONSTRAINT customers_primary_location_id_fkey FOREIGN KEY (primary_location_id) REFERENCES locations(id)
);

-- Visits
CREATE TABLE public.visits (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    org_id uuid NOT NULL,
    location_id uuid NOT NULL,
    customer_id uuid NOT NULL,
    visit_type text NOT NULL DEFAULT 'qr_scan'::text,
    pos_transaction_id text,
    pos_receipt_number text,
    amount numeric,
    items jsonb,
    payment_method text,
    stamps_earned integer DEFAULT 0,
    visited_at timestamp with time zone DEFAULT now(),
    day_of_week smallint,
    hour_of_day smallint,
    is_dead_hour boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT visits_pkey PRIMARY KEY (id),
    CONSTRAINT visits_org_id_fkey FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE,
    CONSTRAINT visits_location_id_fkey FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE,
    CONSTRAINT visits_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

-- Loyalty Programs
CREATE TABLE public.loyalty_programs (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    org_id uuid NOT NULL,
    name text NOT NULL DEFAULT 'Sadakat Karti'::text,
    type text NOT NULL DEFAULT 'stamp'::text,
    stamps_required integer DEFAULT 10,
    points_per_lira numeric DEFAULT 1.0,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT loyalty_programs_pkey PRIMARY KEY (id),
    CONSTRAINT loyalty_programs_org_id_key UNIQUE (org_id),
    CONSTRAINT loyalty_programs_org_id_fkey FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE
);

-- Loyalty Cards
CREATE TABLE public.loyalty_cards (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    org_id uuid NOT NULL,
    customer_id uuid NOT NULL,
    program_id uuid NOT NULL,
    current_stamps integer DEFAULT 0,
    total_stamps integer DEFAULT 0,
    current_points numeric DEFAULT 0,
    total_points numeric DEFAULT 0,
    cards_completed integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT loyalty_cards_pkey PRIMARY KEY (id),
    CONSTRAINT loyalty_cards_org_id_customer_id_key UNIQUE (org_id, customer_id),
    CONSTRAINT loyalty_cards_org_id_fkey FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE,
    CONSTRAINT loyalty_cards_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    CONSTRAINT loyalty_cards_program_id_fkey FOREIGN KEY (program_id) REFERENCES loyalty_programs(id) ON DELETE CASCADE
);

-- Rewards
CREATE TABLE public.rewards (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    org_id uuid NOT NULL,
    program_id uuid NOT NULL,
    name text NOT NULL,
    description text,
    type text NOT NULL DEFAULT 'free_item'::text,
    value numeric,
    points_cost integer,
    image_url text,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT rewards_pkey PRIMARY KEY (id),
    CONSTRAINT rewards_org_id_fkey FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE,
    CONSTRAINT rewards_program_id_fkey FOREIGN KEY (program_id) REFERENCES loyalty_programs(id) ON DELETE CASCADE
);

-- Redemptions
CREATE TABLE public.redemptions (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    org_id uuid NOT NULL,
    customer_id uuid NOT NULL,
    reward_id uuid NOT NULL,
    location_id uuid,
    redeemed_at timestamp with time zone DEFAULT now(),
    verified_by uuid,
    status text DEFAULT 'redeemed'::text,
    created_at timestamp with time zone DEFAULT now(),
    claim_method text DEFAULT 'manual'::text,
    claimed_at timestamp with time zone,
    confirmed_at timestamp with time zone,
    expires_at timestamp with time zone,
    CONSTRAINT redemptions_pkey PRIMARY KEY (id),
    CONSTRAINT redemptions_org_id_fkey FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE,
    CONSTRAINT redemptions_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    CONSTRAINT redemptions_reward_id_fkey FOREIGN KEY (reward_id) REFERENCES rewards(id) ON DELETE CASCADE,
    CONSTRAINT redemptions_location_id_fkey FOREIGN KEY (location_id) REFERENCES locations(id),
    CONSTRAINT redemptions_verified_by_fkey FOREIGN KEY (verified_by) REFERENCES users(id)
);

-- Subscription Plans
CREATE TABLE public.subscription_plans (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    org_id uuid NOT NULL,
    name text NOT NULL,
    description text,
    price_try numeric NOT NULL,
    daily_limit integer NOT NULL DEFAULT 1,
    eligible_items text[] DEFAULT '{}'::text[],
    is_active boolean DEFAULT true,
    sort_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT subscription_plans_pkey PRIMARY KEY (id),
    CONSTRAINT subscription_plans_org_id_fkey FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE
);

-- Customer Subscriptions
CREATE TABLE public.customer_subscriptions (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    org_id uuid NOT NULL,
    customer_id uuid NOT NULL,
    plan_id uuid NOT NULL,
    status text NOT NULL DEFAULT 'active'::text,
    current_period_start timestamp with time zone,
    current_period_end timestamp with time zone,
    cancelled_at timestamp with time zone,
    pause_start timestamp with time zone,
    pause_end timestamp with time zone,
    payment_failures integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    sold_at_location_id uuid,
    CONSTRAINT customer_subscriptions_pkey PRIMARY KEY (id),
    CONSTRAINT customer_subscriptions_org_id_fkey FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE,
    CONSTRAINT customer_subscriptions_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    CONSTRAINT customer_subscriptions_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES subscription_plans(id) ON DELETE CASCADE,
    CONSTRAINT customer_subscriptions_sold_at_location_id_fkey FOREIGN KEY (sold_at_location_id) REFERENCES locations(id)
);

-- Subscription Redemptions
CREATE TABLE public.subscription_redemptions (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    org_id uuid NOT NULL,
    subscription_id uuid NOT NULL,
    customer_id uuid NOT NULL,
    location_id uuid NOT NULL,
    redeemed_at timestamp with time zone DEFAULT now(),
    redeemed_date date NOT NULL,
    redemption_number smallint DEFAULT 1,
    verified_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT subscription_redemptions_pkey PRIMARY KEY (id),
    CONSTRAINT subscription_redemptions_subscription_id_redeemed_date_rede_key UNIQUE (subscription_id, redeemed_date, redemption_number),
    CONSTRAINT subscription_redemptions_org_id_fkey FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE,
    CONSTRAINT subscription_redemptions_subscription_id_fkey FOREIGN KEY (subscription_id) REFERENCES customer_subscriptions(id) ON DELETE CASCADE,
    CONSTRAINT subscription_redemptions_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    CONSTRAINT subscription_redemptions_location_id_fkey FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE,
    CONSTRAINT subscription_redemptions_verified_by_fkey FOREIGN KEY (verified_by) REFERENCES users(id)
);

-- Campaigns
CREATE TABLE public.campaigns (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    org_id uuid NOT NULL,
    name text NOT NULL,
    description text,
    type text NOT NULL,
    status text NOT NULL DEFAULT 'draft'::text,
    target_segment text,
    target_locations uuid[] DEFAULT '{}'::uuid[],
    channel text NOT NULL DEFAULT 'push'::text,
    message_template text,
    message_params jsonb,
    image_url text,
    offer_type text,
    offer_value numeric,
    offer_code text,
    offer_valid_from timestamp with time zone,
    offer_valid_until timestamp with time zone,
    dead_hour_start time without time zone,
    dead_hour_end time without time zone,
    dead_hour_days smallint[] DEFAULT '{1,2,3,4,5}'::smallint[],
    weather_trigger text,
    scheduled_at timestamp with time zone,
    started_at timestamp with time zone,
    completed_at timestamp with time zone,
    ai_generated boolean DEFAULT false,
    ai_prompt text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT campaigns_pkey PRIMARY KEY (id),
    CONSTRAINT campaigns_org_id_fkey FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE
);

-- Campaign Sends
CREATE TABLE public.campaign_sends (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    org_id uuid NOT NULL,
    campaign_id uuid NOT NULL,
    customer_id uuid NOT NULL,
    channel text NOT NULL,
    status text NOT NULL DEFAULT 'pending'::text,
    external_msg_id text,
    sent_at timestamp with time zone,
    delivered_at timestamp with time zone,
    read_at timestamp with time zone,
    failed_reason text,
    cost numeric,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT campaign_sends_pkey PRIMARY KEY (id),
    CONSTRAINT campaign_sends_org_id_fkey FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE,
    CONSTRAINT campaign_sends_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
    CONSTRAINT campaign_sends_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

-- Campaign Redemptions
CREATE TABLE public.campaign_redemptions (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    org_id uuid NOT NULL,
    campaign_id uuid NOT NULL,
    customer_id uuid NOT NULL,
    location_id uuid,
    visit_id uuid,
    redeemed_at timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT campaign_redemptions_pkey PRIMARY KEY (id),
    CONSTRAINT campaign_redemptions_org_id_fkey FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE,
    CONSTRAINT campaign_redemptions_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
    CONSTRAINT campaign_redemptions_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    CONSTRAINT campaign_redemptions_location_id_fkey FOREIGN KEY (location_id) REFERENCES locations(id),
    CONSTRAINT campaign_redemptions_visit_id_fkey FOREIGN KEY (visit_id) REFERENCES visits(id)
);

-- Influencers
CREATE TABLE public.influencers (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    org_id uuid NOT NULL,
    full_name text,
    instagram_handle text,
    tiktok_handle text,
    instagram_id text,
    profile_pic_url text,
    bio text,
    follower_count integer,
    following_count integer,
    avg_engagement_rate numeric,
    avg_likes integer,
    avg_comments integer,
    looyaal_score numeric,
    locality_score numeric,
    status text NOT NULL DEFAULT 'discovered'::text,
    contacted_at timestamp with time zone,
    contact_method text,
    notes text,
    city text,
    district text,
    tags text[] DEFAULT '{}'::text[],
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT influencers_pkey PRIMARY KEY (id),
    CONSTRAINT influencers_org_id_fkey FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE
);

-- Influencer Campaigns
CREATE TABLE public.influencer_campaigns (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    org_id uuid NOT NULL,
    influencer_id uuid NOT NULL,
    location_id uuid,
    deal_type text NOT NULL,
    deal_value numeric,
    deal_description text,
    required_posts integer DEFAULT 1,
    required_stories integer DEFAULT 0,
    required_reels integer DEFAULT 0,
    content_deadline timestamp with time zone,
    unique_code text,
    tracking_url text,
    posts_delivered integer DEFAULT 0,
    stories_delivered integer DEFAULT 0,
    reels_delivered integer DEFAULT 0,
    impressions integer DEFAULT 0,
    reach integer DEFAULT 0,
    clicks integer DEFAULT 0,
    new_customers integer DEFAULT 0,
    revenue_generated numeric DEFAULT 0,
    status text DEFAULT 'proposed'::text,
    started_at timestamp with time zone,
    completed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT influencer_campaigns_pkey PRIMARY KEY (id),
    CONSTRAINT influencer_campaigns_org_id_fkey FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE,
    CONSTRAINT influencer_campaigns_influencer_id_fkey FOREIGN KEY (influencer_id) REFERENCES influencers(id) ON DELETE CASCADE,
    CONSTRAINT influencer_campaigns_location_id_fkey FOREIGN KEY (location_id) REFERENCES locations(id)
);

-- Messages
CREATE TABLE public.messages (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    org_id uuid NOT NULL,
    customer_id uuid NOT NULL,
    channel text NOT NULL,
    direction text NOT NULL DEFAULT 'outbound'::text,
    template_name text,
    message_body text,
    media_url text,
    wa_message_id text,
    wa_category text,
    status text NOT NULL DEFAULT 'pending'::text,
    sent_at timestamp with time zone,
    delivered_at timestamp with time zone,
    read_at timestamp with time zone,
    failed_at timestamp with time zone,
    failure_reason text,
    cost_usd numeric,
    campaign_id uuid,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT messages_pkey PRIMARY KEY (id),
    CONSTRAINT messages_org_id_fkey FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE,
    CONSTRAINT messages_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    CONSTRAINT messages_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES campaigns(id)
);

-- Reviews
CREATE TABLE public.reviews (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    org_id uuid NOT NULL,
    location_id uuid NOT NULL,
    customer_id uuid,
    google_review_id text,
    author_name text,
    rating smallint NOT NULL,
    review_text text,
    review_language text DEFAULT 'tr'::text,
    published_at timestamp with time zone,
    sentiment text,
    sentiment_score numeric,
    response_text text,
    responded_at timestamp with time zone,
    is_flagged boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT reviews_pkey PRIMARY KEY (id),
    CONSTRAINT reviews_org_id_fkey FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE,
    CONSTRAINT reviews_location_id_fkey FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE,
    CONSTRAINT reviews_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES customers(id)
);

-- Menu Items
CREATE TABLE public.menu_items (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    org_id uuid NOT NULL,
    name text NOT NULL,
    description text,
    price numeric,
    image_url text,
    category text DEFAULT 'drink'::text,
    is_featured boolean DEFAULT false,
    is_active boolean DEFAULT true,
    sort_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT menu_items_pkey PRIMARY KEY (id),
    CONSTRAINT menu_items_org_id_fkey FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE
);

-- Daily Location Stats
CREATE TABLE public.daily_location_stats (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    org_id uuid NOT NULL,
    location_id uuid NOT NULL,
    stat_date date NOT NULL,
    total_visits integer DEFAULT 0,
    unique_customers integer DEFAULT 0,
    new_customers integer DEFAULT 0,
    returning_customers integer DEFAULT 0,
    total_revenue numeric DEFAULT 0,
    avg_transaction numeric DEFAULT 0,
    stamps_given integer DEFAULT 0,
    rewards_redeemed integer DEFAULT 0,
    subscriptions_redeemed integer DEFAULT 0,
    campaign_redemptions integer DEFAULT 0,
    visits_by_hour integer[] DEFAULT ARRAY[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT daily_location_stats_pkey PRIMARY KEY (id),
    CONSTRAINT daily_location_stats_location_id_stat_date_key UNIQUE (location_id, stat_date),
    CONSTRAINT daily_location_stats_org_id_fkey FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE,
    CONSTRAINT daily_location_stats_location_id_fkey FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE
);


-- ============================================================
-- AI ENGINE TABLES
-- ============================================================

-- Weather Data
CREATE TABLE public.weather_data (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    location_id uuid NOT NULL,
    checked_at timestamp with time zone DEFAULT now(),
    temperature numeric,
    feels_like numeric,
    humidity integer,
    weather_main text,
    weather_desc text,
    wind_speed numeric,
    is_rainy boolean DEFAULT false,
    is_cold boolean DEFAULT false,
    is_hot boolean DEFAULT false,
    CONSTRAINT weather_data_pkey PRIMARY KEY (id),
    CONSTRAINT weather_data_location_id_fkey FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE
);

-- Shop Intelligence
CREATE TABLE public.shop_intelligence (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    org_id uuid NOT NULL,
    avg_effective_discount numeric,
    best_campaign_type text,
    best_send_hour smallint,
    avg_click_rate numeric,
    avg_visit_after_notification numeric,
    dead_hour_prediction_accuracy numeric,
    rainy_day_visit_drop numeric,
    cold_day_visit_drop numeric,
    hot_day_visit_drop numeric,
    last_computed_at timestamp with time zone,
    CONSTRAINT shop_intelligence_pkey PRIMARY KEY (id),
    CONSTRAINT shop_intelligence_org_id_key UNIQUE (org_id),
    CONSTRAINT shop_intelligence_org_id_fkey FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE
);

-- Notification Queue
CREATE TABLE public.notification_queue (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    org_id uuid NOT NULL,
    customer_id uuid NOT NULL,
    campaign_id uuid,
    title text NOT NULL,
    body text NOT NULL,
    url text,
    scheduled_for timestamp with time zone NOT NULL,
    status text DEFAULT 'queued'::text,
    sent_at timestamp with time zone,
    clicked_at timestamp with time zone,
    discount_used numeric,
    personalization_tier text,
    offer_type text,
    offer_value numeric,
    valid_until timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT notification_queue_pkey PRIMARY KEY (id),
    CONSTRAINT notification_queue_org_id_fkey FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE,
    CONSTRAINT notification_queue_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    CONSTRAINT notification_queue_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES campaigns(id)
);

-- Auto Campaign Settings
CREATE TABLE public.auto_campaign_settings (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    org_id uuid NOT NULL,
    type text NOT NULL,
    is_enabled boolean DEFAULT false,
    auto_approve boolean DEFAULT false,
    default_offer_type text DEFAULT 'discount_percent'::text,
    default_offer_value numeric DEFAULT 20,
    min_severity numeric DEFAULT 0.6,
    churn_threshold numeric DEFAULT 0.7,
    cooldown_days integer DEFAULT 14,
    send_time time without time zone DEFAULT '09:00'::time,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT auto_campaign_settings_pkey PRIMARY KEY (id),
    CONSTRAINT auto_campaign_settings_org_id_type_key UNIQUE (org_id, type),
    CONSTRAINT auto_campaign_settings_org_id_fkey FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE
);

-- Dead Hour Suggestions
CREATE TABLE public.dead_hour_suggestions (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    org_id uuid NOT NULL,
    location_id uuid NOT NULL,
    day_of_week smallint NOT NULL,
    hour smallint NOT NULL,
    avg_visits numeric DEFAULT 0,
    overall_avg numeric DEFAULT 0,
    severity numeric DEFAULT 0,
    is_approved boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT dead_hour_suggestions_pkey PRIMARY KEY (id),
    CONSTRAINT dead_hour_suggestions_location_id_day_of_week_hour_key UNIQUE (location_id, day_of_week, hour),
    CONSTRAINT dead_hour_suggestions_org_id_fkey FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE,
    CONSTRAINT dead_hour_suggestions_location_id_fkey FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE
);

-- ============================================================
-- AUTH & SESSION TABLES
-- ============================================================

-- Active Sessions
CREATE TABLE public.active_sessions (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    org_id uuid NOT NULL,
    customer_id uuid NOT NULL,
    location_id uuid,
    last_active_at timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT active_sessions_pkey PRIMARY KEY (id),
    CONSTRAINT active_sessions_customer_unique UNIQUE (customer_id),
    CONSTRAINT active_sessions_org_id_fkey FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE,
    CONSTRAINT active_sessions_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    CONSTRAINT active_sessions_location_id_fkey FOREIGN KEY (location_id) REFERENCES locations(id)
);


-- QR Tokens
CREATE TABLE public.qr_tokens (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    org_id uuid NOT NULL,
    customer_id uuid NOT NULL,
    type text NOT NULL,
    payload jsonb DEFAULT '{}'::jsonb,
    token text NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    used_at timestamp with time zone,
    used_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT qr_tokens_pkey PRIMARY KEY (id),
    CONSTRAINT qr_tokens_token_key UNIQUE (token),
    CONSTRAINT qr_tokens_org_id_fkey FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE,
    CONSTRAINT qr_tokens_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    CONSTRAINT qr_tokens_used_by_fkey FOREIGN KEY (used_by) REFERENCES users(id)
);


-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_locations_org ON locations(org_id);
CREATE INDEX idx_locations_city ON locations(city);
CREATE INDEX idx_locations_google ON locations(google_place_id);

CREATE INDEX idx_users_org ON users(org_id);
CREATE INDEX idx_users_email ON users(email);

CREATE INDEX idx_customers_org ON customers(org_id);
CREATE INDEX idx_customers_phone ON customers(org_id, phone);
CREATE INDEX idx_customers_rfm ON customers(org_id, rfm_segment);
CREATE INDEX idx_customers_churn ON customers(org_id, churn_risk DESC);
CREATE INDEX idx_customers_last_visit ON customers(org_id, last_visit_at);

CREATE INDEX idx_visits_org ON visits(org_id);
CREATE INDEX idx_visits_customer ON visits(customer_id);
CREATE INDEX idx_visits_location ON visits(location_id);
CREATE INDEX idx_visits_time ON visits(org_id, visited_at);
CREATE INDEX idx_visits_hour ON visits(org_id, location_id, day_of_week, hour_of_day);

CREATE INDEX idx_loyalty_cards_customer ON loyalty_cards(customer_id);
CREATE INDEX idx_redemptions_customer ON redemptions(customer_id);

CREATE INDEX idx_sub_plans_org ON subscription_plans(org_id);
CREATE INDEX idx_customer_subs_org ON customer_subscriptions(org_id);
CREATE INDEX idx_customer_subs_customer ON customer_subscriptions(customer_id);
CREATE INDEX idx_customer_subs_status ON customer_subscriptions(org_id, status);
CREATE INDEX idx_sub_redemptions_date ON subscription_redemptions(subscription_id, redeemed_date);

CREATE INDEX idx_campaigns_org ON campaigns(org_id);
CREATE INDEX idx_campaigns_status ON campaigns(org_id, status);
CREATE INDEX idx_campaigns_type ON campaigns(org_id, type);
CREATE INDEX idx_campaign_sends_campaign ON campaign_sends(campaign_id);
CREATE INDEX idx_campaign_sends_customer ON campaign_sends(customer_id);
CREATE INDEX idx_campaign_sends_status ON campaign_sends(campaign_id, status);
CREATE INDEX idx_campaign_sends_customer_sent ON campaign_sends(customer_id, sent_at);
CREATE INDEX idx_campaign_sends_customer_freq ON campaign_sends(customer_id, status, sent_at);
CREATE INDEX idx_campaign_redemptions_campaign ON campaign_redemptions(campaign_id);

CREATE INDEX idx_influencers_org ON influencers(org_id);
CREATE INDEX idx_influencers_status ON influencers(org_id, status);
CREATE INDEX idx_influencers_city ON influencers(org_id, city);
CREATE INDEX idx_influencers_score ON influencers(org_id, looyaal_score DESC);
CREATE INDEX idx_inf_campaigns_org ON influencer_campaigns(org_id);
CREATE INDEX idx_inf_campaigns_influencer ON influencer_campaigns(influencer_id);

CREATE INDEX idx_messages_org ON messages(org_id);
CREATE INDEX idx_messages_customer ON messages(customer_id);
CREATE INDEX idx_messages_campaign ON messages(campaign_id);
CREATE INDEX idx_messages_status ON messages(org_id, channel, status);
CREATE INDEX idx_messages_sent ON messages(org_id, sent_at);

CREATE INDEX idx_reviews_org ON reviews(org_id);
CREATE INDEX idx_reviews_location ON reviews(location_id);
CREATE INDEX idx_reviews_rating ON reviews(org_id, rating);
CREATE INDEX idx_reviews_sentiment ON reviews(org_id, sentiment);

CREATE INDEX idx_menu_items_org ON menu_items(org_id);

CREATE INDEX idx_daily_stats_org_date ON daily_location_stats(org_id, stat_date);

CREATE INDEX idx_notification_queue_scheduled ON notification_queue(status, scheduled_for);
CREATE INDEX idx_notification_queue_customer ON notification_queue(customer_id, status);
CREATE INDEX idx_notification_queue_processing ON notification_queue(status, scheduled_for) WHERE status = 'queued';

CREATE INDEX idx_dead_hour_org ON dead_hour_suggestions(org_id);
CREATE INDEX idx_dead_hour_location ON dead_hour_suggestions(location_id, day_of_week);

CREATE INDEX idx_active_sessions_location ON active_sessions(location_id, last_active_at);
CREATE INDEX idx_qr_tokens_token ON qr_tokens(token);
CREATE INDEX idx_qr_tokens_customer ON qr_tokens(customer_id, created_at);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_sends ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE influencers ENABLE ROW LEVEL SECURITY;
ALTER TABLE influencer_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_location_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE auto_campaign_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE dead_hour_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_intelligence ENABLE ROW LEVEL SECURITY;
ALTER TABLE active_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE qr_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE weather_data ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can only access their org data" ON organizations FOR ALL USING (id = get_user_org_id()) WITH CHECK (id = get_user_org_id());
CREATE POLICY "Users can only access their own data" ON users FOR ALL USING (org_id = get_user_org_id()) WITH CHECK (org_id = get_user_org_id());
CREATE POLICY "Users can only access their org data" ON locations FOR ALL USING (org_id = get_user_org_id()) WITH CHECK (org_id = get_user_org_id());
CREATE POLICY "Users can only access their org data" ON customers FOR ALL USING (org_id = get_user_org_id()) WITH CHECK (org_id = get_user_org_id());
CREATE POLICY "Users can only access their org data" ON visits FOR ALL USING (org_id = get_user_org_id()) WITH CHECK (org_id = get_user_org_id());
CREATE POLICY "Users can only access their org data" ON loyalty_programs FOR ALL USING (org_id = get_user_org_id()) WITH CHECK (org_id = get_user_org_id());
CREATE POLICY "Users can only access their org data" ON loyalty_cards FOR ALL USING (org_id = get_user_org_id()) WITH CHECK (org_id = get_user_org_id());
CREATE POLICY "Users can only access their org data" ON rewards FOR ALL USING (org_id = get_user_org_id()) WITH CHECK (org_id = get_user_org_id());
CREATE POLICY "Users can only access their org data" ON redemptions FOR ALL USING (org_id = get_user_org_id()) WITH CHECK (org_id = get_user_org_id());
CREATE POLICY "Users can only access their org data" ON subscription_plans FOR ALL USING (org_id = get_user_org_id()) WITH CHECK (org_id = get_user_org_id());
CREATE POLICY "Users can only access their org data" ON customer_subscriptions FOR ALL USING (org_id = get_user_org_id()) WITH CHECK (org_id = get_user_org_id());
CREATE POLICY "Users can only access their org data" ON subscription_redemptions FOR ALL USING (org_id = get_user_org_id()) WITH CHECK (org_id = get_user_org_id());
CREATE POLICY "Users can only access their org data" ON campaigns FOR ALL USING (org_id = get_user_org_id()) WITH CHECK (org_id = get_user_org_id());
CREATE POLICY "Users can only access their org data" ON campaign_sends FOR ALL USING (org_id = get_user_org_id()) WITH CHECK (org_id = get_user_org_id());
CREATE POLICY "Users can only access their org data" ON campaign_redemptions FOR ALL USING (org_id = get_user_org_id()) WITH CHECK (org_id = get_user_org_id());
CREATE POLICY "Users can only access their org data" ON influencers FOR ALL USING (org_id = get_user_org_id()) WITH CHECK (org_id = get_user_org_id());
CREATE POLICY "Users can only access their org data" ON influencer_campaigns FOR ALL USING (org_id = get_user_org_id()) WITH CHECK (org_id = get_user_org_id());
CREATE POLICY "Users can only access their org data" ON messages FOR ALL USING (org_id = get_user_org_id()) WITH CHECK (org_id = get_user_org_id());
CREATE POLICY "Users can only access their org data" ON reviews FOR ALL USING (org_id = get_user_org_id()) WITH CHECK (org_id = get_user_org_id());
CREATE POLICY "Users can only access their org data" ON daily_location_stats FOR ALL USING (org_id = get_user_org_id()) WITH CHECK (org_id = get_user_org_id());
CREATE POLICY "Users can only access their org menu items" ON menu_items FOR ALL USING (org_id = get_user_org_id()) WITH CHECK (org_id = get_user_org_id());
CREATE POLICY "Users can only access their org data" ON notification_queue FOR ALL USING (org_id = get_user_org_id()) WITH CHECK (org_id = get_user_org_id());
CREATE POLICY "Users can only access their org data" ON auto_campaign_settings FOR ALL USING (org_id = get_user_org_id()) WITH CHECK (org_id = get_user_org_id());
CREATE POLICY "Users can only access their org data" ON dead_hour_suggestions FOR ALL USING (org_id = get_user_org_id()) WITH CHECK (org_id = get_user_org_id());
CREATE POLICY "Users can only access their org data" ON shop_intelligence FOR ALL USING (org_id = get_user_org_id()) WITH CHECK (org_id = get_user_org_id());

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Auto-create org + user + loyalty program on auth.users insert
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- GRANTS
-- ============================================================
-- Required for self-hosted Supabase when public schema was recreated.
-- On Supabase cloud these are managed automatically, but a fresh
-- DROP SCHEMA public CASCADE wipes them. Without these, all queries
-- through the REST API return "permission denied for table ..." (42501)
-- which manifests as login redirect loops.

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon, authenticated, service_role;

-- ============================================================
-- SINGLE-CAFE INSTALL
-- ============================================================
-- One Looyaal install serves exactly one organization.
CREATE UNIQUE INDEX organizations_single_install ON organizations ((true));
