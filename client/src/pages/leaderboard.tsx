import { Trophy } from 'lucide-react';
import { useEffect, useState } from 'react';
import Avatar from '../components/ui/avatar';
import Heading from '../components/ui/heading';
import { Table, Tbody, Td, Th, Thead, Tr } from '../components/ui/table';
import Text from '../components/ui/text';
import api from '../lib/api';
import { cn } from '../lib/cn';

type Row = {
  userId: string;
  name: string;
  rank?: number;
  completedCourses: number;
  averageQuizScore: number;
  isCurrentUser?: boolean;
};

export default function Leaderboard() {
  const [rows, setRows] = useState<Row[]>([]);
  useEffect(() => {
    void api.get('/leaderboard').then(({ data }) => setRows(data.leaderboard || []));
  }, []);

  return (
    <div>
      <Heading size="headline">Leaderboard</Heading>
      <Text muted className="mt-sm mb-xl">
        Ranked by completed courses, then quiz score.
      </Text>
      <Table>
        <Thead>
          <Tr>
            <Th>Rank</Th>
            <Th>Learner</Th>
            <Th>Completed</Th>
            <Th>Avg quiz</Th>
          </Tr>
        </Thead>
        <Tbody>
          {rows.map((row) => (
            <Tr
              key={row.userId}
              className={row.isCurrentUser ? 'bg-primary-fixed/70 font-semibold hover:bg-primary-fixed' : ''}
            >
              <Td>
                <span
                  className={cn(
                    'inline-flex h-8 w-8 items-center justify-center rounded-full text-caption',
                    row.rank === 1 && 'bg-secondary-container text-on-secondary-container',
                    row.rank === 2 && 'bg-surface-container-high text-on-surface',
                    row.rank === 3 && 'bg-secondary-fixed text-on-secondary-container',
                    (!row.rank || row.rank > 3) && 'bg-surface-container text-on-surface-variant',
                  )}
                >
                  {row.rank === 1 ? <Trophy size={14} /> : row.rank || '—'}
                </span>
              </Td>
              <Td>
                <div className="flex items-center gap-sm">
                  <Avatar name={row.name} className="h-8 w-8" />
                  <span>
                    {row.name}
                    {row.isCurrentUser ? ' (you)' : ''}
                  </span>
                </div>
              </Td>
              <Td>{row.completedCourses}</Td>
              <Td>{row.averageQuizScore}%</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </div>
  );
}
