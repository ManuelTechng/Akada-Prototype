import { supabase } from '../../supabase';
import type { Database } from '../../database.types';

type Course = Database['public']['Tables']['courses']['Row'];
type CourseInsert = Database['public']['Tables']['courses']['Insert'];
type CourseUpdate = Database['public']['Tables']['courses']['Update'];
type ProgramCourse = Database['public']['Tables']['program_courses']['Row'];

export interface CourseWithPrerequisites extends Course {
  prerequisites_details?: Array<{
    id: string;
    course_code: string;
    course_name: string;
  }>;
}

export interface ProgramCourseWithDetails extends ProgramCourse {
  course: Course;
}

export interface CourseByYearSemester {
  year: number;
  semester: number;
  courses: Array<ProgramCourseWithDetails>;
}

/**
 * Get all courses for a specific program
 */
export async function getProgramCourses(programId: string): Promise<ProgramCourseWithDetails[]> {
  try {
    const { data, error } = await supabase
      .from('program_courses')
      .select(`
        *,
        course:courses(*)
      `)
      .eq('program_id', programId)
      .order('year', { ascending: true })
      .order('semester', { ascending: true })
      .order('course_order', { ascending: true });

    if (error) {
      console.error('Error fetching program courses:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getProgramCourses:', error);
    throw error;
  }
}

/**
 * Get courses for a program grouped by year and semester
 */
export async function getProgramCoursesGrouped(programId: string): Promise<CourseByYearSemester[]> {
  try {
    const courses = await getProgramCourses(programId);
    
    // Group courses by year and semester
    const grouped = courses.reduce((acc, programCourse) => {
      const key = `${programCourse.year}-${programCourse.semester}`;
      if (!acc[key]) {
        acc[key] = {
          year: programCourse.year,
          semester: programCourse.semester,
          courses: []
        };
      }
      acc[key].courses.push(programCourse);
      return acc;
    }, {} as Record<string, CourseByYearSemester>);

    return Object.values(grouped).sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.semester - b.semester;
    });
  } catch (error) {
    console.error('Error in getProgramCoursesGrouped:', error);
    throw error;
  }
}

/**
 * Get a single course by ID
 */
export async function getCourseById(courseId: string): Promise<Course | null> {
  try {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .single();

    if (error) {
      console.error('Error fetching course by ID:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in getCourseById:', error);
    throw error;
  }
}

/**
 * Get course with prerequisite details
 */
export async function getCourseWithPrerequisites(courseId: string): Promise<CourseWithPrerequisites | null> {
  try {
    const course = await getCourseById(courseId);
    if (!course) return null;

    // Get prerequisite details if prerequisites exist
    let prerequisites_details = [];
    if (course.prerequisites && course.prerequisites.length > 0) {
      const { data, error } = await supabase
        .from('courses')
        .select('id, course_code, course_name')
        .in('course_code', course.prerequisites);

      if (error) {
        console.error('Error fetching prerequisite details:', error);
        // Don't throw error, just return course without prerequisites
      } else {
        prerequisites_details = data || [];
      }
    }

    return {
      ...course,
      prerequisites_details
    };
  } catch (error) {
    console.error('Error in getCourseWithPrerequisites:', error);
    throw error;
  }
}

/**
 * Get courses with prerequisites for a program (for dependency mapping)
 */
export async function getCoursesWithPrerequisites(programId: string): Promise<CourseWithPrerequisites[]> {
  try {
    const programCourses = await getProgramCourses(programId);
    const courseIds = programCourses.map(pc => pc.course_id);

    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .in('id', courseIds);

    if (error) {
      console.error('Error fetching courses with prerequisites:', error);
      throw error;
    }

    const courses = data || [];
    
    // For each course, get its prerequisite details
    const coursesWithPrerequisites = await Promise.all(
      courses.map(async (course) => {
        let prerequisites_details = [];
        if (course.prerequisites && course.prerequisites.length > 0) {
          const { data: prereqData, error: prereqError } = await supabase
            .from('courses')
            .select('id, course_code, course_name')
            .in('course_code', course.prerequisites);

          if (!prereqError) {
            prerequisites_details = prereqData || [];
          }
        }

        return {
          ...course,
          prerequisites_details
        };
      })
    );

    return coursesWithPrerequisites;
  } catch (error) {
    console.error('Error in getCoursesWithPrerequisites:', error);
    throw error;
  }
}

/**
 * Search courses by name or code
 */
export async function searchCourses(filters: {
  query?: string;
  courseLevel?: string;
  limit?: number;
}): Promise<Course[]> {
  try {
    let query = supabase
      .from('courses')
      .select('*')
      .eq('is_active', true)
      .order('course_code');

    // Apply text search filter
    if (filters.query) {
      query = query.or(`course_name.ilike.%${filters.query}%,course_code.ilike.%${filters.query}%`);
    }

    // Apply course level filter
    if (filters.courseLevel) {
      query = query.eq('course_level', filters.courseLevel);
    }

    // Apply limit
    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error searching courses:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in searchCourses:', error);
    throw error;
  }
}

/**
 * Get courses by level (undergraduate, graduate, postgraduate)
 */
export async function getCoursesByLevel(level: string): Promise<Course[]> {
  try {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('course_level', level)
      .eq('is_active', true)
      .order('course_code');

    if (error) {
      console.error('Error fetching courses by level:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getCoursesByLevel:', error);
    throw error;
  }
}

/**
 * Create a new course
 */
export async function createCourse(course: CourseInsert): Promise<Course> {
  try {
    const { data, error } = await supabase
      .from('courses')
      .insert(course)
      .select()
      .single();

    if (error) {
      console.error('Error creating course:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in createCourse:', error);
    throw error;
  }
}

/**
 * Update a course
 */
export async function updateCourse(courseId: string, updates: CourseUpdate): Promise<Course> {
  try {
    const { data, error } = await supabase
      .from('courses')
      .update(updates)
      .eq('id', courseId)
      .select()
      .single();

    if (error) {
      console.error('Error updating course:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in updateCourse:', error);
    throw error;
  }
}

/**
 * Add a course to a program
 */
export async function addCourseToProgram(
  programId: string,
  courseId: string,
  year: number,
  semester: number,
  isRequired: boolean = true,
  courseOrder?: number
): Promise<ProgramCourse> {
  try {
    const { data, error } = await supabase
      .from('program_courses')
      .insert({
        program_id: programId,
        course_id: courseId,
        year,
        semester,
        is_required: isRequired,
        course_order: courseOrder
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding course to program:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in addCourseToProgram:', error);
    throw error;
  }
}

/**
 * Remove a course from a program
 */
export async function removeCourseFromProgram(programId: string, courseId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('program_courses')
      .delete()
      .eq('program_id', programId)
      .eq('course_id', courseId);

    if (error) {
      console.error('Error removing course from program:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in removeCourseFromProgram:', error);
    throw error;
  }
}


