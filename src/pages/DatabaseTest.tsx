import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
console.log("Supabase URL:", supabaseUrl)

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// src/App.jsx

function DatabaseTest() {
  const [table, setTable] = useState<any[]>([])

  useEffect(() => {
    const fetchTable = async () => {
      const { data, error } = await supabase.from('tourneys').select('*')
      if (error) {
        console.error('Error fetching tourneys:', error)
      } else {
        setTable(data)
      }
    }

    fetchTable()
  }, [])

  return (
    <ul>
    {table.map((row) => (
        <li key={row.id}>{row.name}</li>
    ))}
    </ul>
  )
}

export default DatabaseTest