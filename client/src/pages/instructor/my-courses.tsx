import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Badge from '../../components/ui/badge';
import Button from '../../components/ui/button';
import Heading from '../../components/ui/heading';
import Modal from '../../components/ui/modal';
import { Table, Tbody, Td, Th, Thead, Tr } from '../../components/ui/table';
import Text from '../../components/ui/text';
import api from '../../lib/api';

type Course = {
  _id: string;
  title: string;
  enrolledStudents?: unknown[];
  lessons?: unknown[];
  isPublished?: boolean;
};

export default function MyCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const load = async () => {
    const { data } = await api.get('/courses/instructor/mine');
    setCourses(data.courses || []);
  };

  useEffect(() => {
    void load();
  }, []);

  const remove = async () => {
    if (!pendingId) return;
    await api.delete(`/courses/${pendingId}`);
    setPendingId(null);
    await load();
  };

  return (
    <div className="space-y-lg">
      <div className="flex flex-wrap items-center justify-between gap-md">
        <Heading size="headline">My Courses</Heading>
        <Button to="/instructor/courses/new">Create course</Button>
      </div>
      {!courses.length ? (
        <Text muted>You have not created any courses yet.</Text>
      ) : (
        <Table>
          <Thead>
            <Tr>
              <Th>Course</Th>
              <Th>Students</Th>
              <Th>Lessons</Th>
              <Th>Status</Th>
              <Th className="text-right">Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {courses.map((course) => {
              const published = course.isPublished !== false;
              return (
                <Tr key={course._id}>
                  <Td>
                    <Link
                      to={`/courses/${course._id}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {course.title}
                    </Link>
                  </Td>
                  <Td>{course.enrolledStudents?.length || 0}</Td>
                  <Td>{course.lessons?.length || 0}</Td>
                  <Td>
                    <Badge tone={published ? 'primary' : 'neutral'}>
                      {published ? 'Published' : 'Draft'}
                    </Badge>
                  </Td>
                  <Td>
                    <div className="flex justify-end gap-sm">
                      {published ? null : (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() =>
                            void api.put(`/courses/${course._id}`, { isPublished: true }).then(load)
                          }
                        >
                          Publish
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" to={`/instructor/courses/${course._id}/quiz`}>
                        Quiz
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setPendingId(course._id)}>
                        Delete
                      </Button>
                    </div>
                  </Td>
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      )}
      <Modal
        open={Boolean(pendingId)}
        onClose={() => setPendingId(null)}
        title="Delete course?"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setPendingId(null)}>
              Cancel
            </Button>
            <Button size="sm" onClick={() => void remove()}>
              Delete
            </Button>
          </>
        }
      >
        <Text>This course will be removed. Enrolled students will lose access.</Text>
      </Modal>
    </div>
  );
}
