'use client'

import { motion } from 'motion/react'

interface Tab {
  id: string
  label: string
}

interface TabBarProps {
  tabs: Tab[]
  activeTab: string
  onChange: (tabId: string) => void
}

export function TabBar({ tabs, activeTab, onChange }: TabBarProps) {
  return (
    <div className="flex gap-1 border-b border-gray-200">
      {tabs.map((tab) => (
        <motion.button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          whileHover={{ backgroundColor: activeTab === tab.id ? 'rgba(0,0,0,0.03)' : 'rgba(0,0,0,0.06)', color: '#111827' }}
          whileTap={{ scale: 0.96, backgroundColor: 'rgba(0,0,0,0.1)' }}
          transition={{ duration: 0.15 }}
          className={`relative px-4 py-2.5 text-sm font-medium rounded-lg cursor-pointer ${
            activeTab === tab.id
              ? 'text-gray-900'
              : 'text-gray-400'
          }`}
        >
          {tab.label}
          {activeTab === tab.id && (
            <motion.div
              layoutId="tab-underline"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-600"
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
          )}
        </motion.button>
      ))}
    </div>
  )
}
