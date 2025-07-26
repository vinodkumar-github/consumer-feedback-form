"use client";
import { useEffect, useState } from "react";
import { getQuizSubmissions } from '@/lib/quizService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from '@/components/ui/table';

function isValidString(val: unknown) {
  return typeof val === 'string' && val.trim().length > 0;
}

const NAME_KEYS = ['name', 'Please provide your details below to enter our lucky draw.'];
const EMAIL_KEYS = ['email', 'question11'];
const PHONE_KEYS = ['phone', 'Phone'];

function getField(responses: Record<string, any>, keys: string[]) {
  for (const key of keys) {
    if (isValidString(responses[key])) return responses[key];
  }
  return '';
}

function getValidEntries(submissions: any[]) {
  return submissions.filter((entry) => {
    const responses = entry.user_responses || {};
    return (
      isValidString(getField(responses, NAME_KEYS)) &&
      isValidString(getField(responses, EMAIL_KEYS)) &&
      isValidString(getField(responses, PHONE_KEYS))
    );
  });
}

export default function LuckyDrawPage() {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [winner, setWinner] = useState<any | null>(null);
  const [drawError, setDrawError] = useState<string | null>(null);

  async function fetchEntries() {
    setLoading(true);
    setError(null);
    setWinner(null);
    setDrawError(null);
    try {
      const { data, error } = await getQuizSubmissions();
      if (error) {
        setError(error);
        setEntries([]);
      } else {
        setEntries(getValidEntries(data || []));
      }
    } catch (e) {
      setError('Failed to fetch entries.');
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchEntries();
    const interval = setInterval(fetchEntries, 10000);
    return () => clearInterval(interval);
  }, []);

  function handleLuckyDraw() {
    setWinner(null);
    setDrawError(null);
    if (entries.length < 4) {
      setDrawError('More feedbacks than 3 are needed to give lucky draw winner list.');
      return;
    }
    // Randomly select a winner
    const idx = Math.floor(Math.random() * entries.length);
    setWinner(entries[idx]);
  }

  return (
    <div className="min-h-screen py-10 px-4 bg-gradient-to-br from-amber-50 to-blue-50">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Lucky Draw Entries</CardTitle>
        </CardHeader>
        <CardContent>
          {error && <div className="text-red-600 mb-4">Error: {error}</div>}
          <div className="overflow-x-auto">
            <Table>
              <TableCaption>All valid entries for the lucky draw.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Submitted At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-gray-500">Loading...</TableCell>
                  </TableRow>
                ) : entries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-gray-500">No valid entries found.</TableCell>
                  </TableRow>
                ) : (
                  entries.map((entry, idx) => {
                    const responses = entry.user_responses || {};
                    return (
                      <TableRow key={entry.id || idx}>
                        <TableCell>{getField(responses, NAME_KEYS)}</TableCell>
                        <TableCell>{getField(responses, EMAIL_KEYS)}</TableCell>
                        <TableCell>{getField(responses, PHONE_KEYS)}</TableCell>
                        <TableCell className="text-xs text-gray-500">{entry.created_at ? new Date(entry.created_at).toLocaleString() : ''}</TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex flex-col items-center mt-8 gap-4">
            <Button onClick={handleLuckyDraw} size="lg" className="text-lg px-8 py-4">Draw Lucky Winner</Button>
            {drawError && <div className="text-red-600 font-semibold">{drawError}</div>}
            {winner && (
              <Card className="mt-4 w-full max-w-md border-2 border-amber-400 shadow-lg">
                <CardHeader>
                  <CardTitle>🎉 Lucky Draw Winner 🎉</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-bold mb-2">{getField(winner.user_responses, NAME_KEYS)}</div>
                  <div className="mb-1">Email: <span className="font-mono">{getField(winner.user_responses, EMAIL_KEYS)}</span></div>
                  <div>Phone: <span className="font-mono">{getField(winner.user_responses, PHONE_KEYS)}</span></div>
                  <div className="text-xs text-gray-500 mt-2">Submitted: {winner.created_at ? new Date(winner.created_at).toLocaleString() : ''}</div>
                </CardContent>
              </Card>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 