import { Link } from 'react-router-dom';
import getSupabaseTable from '../hooks/getSupabaseTable';
import type { Tourney } from '../types/tourney';

function Home() {
    const { data: tourneys, loading, error } = getSupabaseTable<Tourney>('tourneys');

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error.message}</p>;

    // (temporary) sorting Tournaments by ID;
    // eventually display in some sort of table and split active/inactive and "admin" member tourneys
    tourneys.sort((a, b) => a.id - b.id);
    return (
        <>
        <title>Tourneys</title>
        <ul>
        {tourneys.map((row: any) => (
            <li key={row.id}>
                {row.id}: <Link to={`/tourney/${row.id}`}>{row.name} ({row.type})</Link>
            </li>
        ))}
        </ul>
        </>
    )
}

export default Home;