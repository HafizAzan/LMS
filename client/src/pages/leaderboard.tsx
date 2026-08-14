import { useEffect, useState } from 'react';
import Heading from '../components/ui/heading';
import { Table, Tbody, Td, Th, Thead, Tr } from '../components/ui/table';
import Text from '../components/ui/text';
import api from '../lib/api';

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
            <Tr key={row.userId} className={row.isCurrentUser ? 'bg-primary-fixed font-semibold' : ''}>
              <Td>{row.rank || '—'}</Td>
              <Td>
                {row.name}
                {row.isCurrentUser ? ' (you)' : ''}
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
