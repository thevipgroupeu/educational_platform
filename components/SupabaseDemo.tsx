'use client'

import { useState, useEffect } from 'react'
import { createSupabaseClient } from '@/lib/supabase/client'

export default function SupabaseDemo() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const supabase = createSupabaseClient()
        
        // Example: Replace with your actual table name
        // const { data, error } = await supabase
        //   .from('your_table_name')
        //   .select()
        
        // For now, just show a placeholder
        setData([])
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Supabase Data</h2>
      {data.length === 0 ? (
        <p className="text-gray-500">
          No data yet. Configure your Supabase table and update the component.
        </p>
      ) : (
        <pre>{JSON.stringify(data, null, 2)}</pre>
      )}
    </div>
  )
}
