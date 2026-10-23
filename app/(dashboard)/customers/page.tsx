import { redirect } from 'next/navigation'

export default function CustomersPage() {
  redirect('/hub?tab=customers')
}
