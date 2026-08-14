import { useEffect, useState } from 'react';
import Heading from '../../components/ui/heading';
import { Table, Tbody, Td, Th, Thead, Tr } from '../../components/ui/table';
import Text from '../../components/ui/text';
import api from '../../lib/api';

type Row = { courseTitle: string; student: { _id: string; name?: string; email?: string } };

export default function InstructorStudents() {
  const [rows, setRows] = useState<Row[]>([]);
  useEffect(() => {
    const load = async () => {
      const { data } = await api.get('/courses/instructor/mine');
      const list = (data.courses || []).flatMap(
        (course: {
          title: string;
          enrolledStudents?: Array<{ _id: string; name?: string; email?: string }>;
        }) => (course.enrolledStudents || []).map((student) => ({ courseTitle: course.title, student })),
      );
      setRows(list);
    };
    void load();
  }, []);

  return (
    <div>
      <Heading size="headline" className="mb-xl">
        Students
      </Heading>
      {!rows.length ? <Text muted>No students have enrolled yet.</Text> : null}
      {rows.length ? (
        <Table>
          <Thead>
            <Tr>
              <Th>Student</Th>
              <Th>Email</Th>
              <Th>Course</Th>
            </Tr>
          </Thead>
          <Tbody>
            {rows.map((row) => (
              <Tr key={`${row.courseTitle}-${row.student._id}`}>
                <Td>{row.student.name}</Td>
                <Td>{row.student.email}</Td>
                <Td>{row.courseTitle}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      ) : null}
    </div>
  );
}
