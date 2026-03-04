export interface ActivityItem {
  id: number;
  type: 'post' | 'connection' | 'interaction';
  title: string;
  description: string;
  date: string;
}

export interface ProfileData {
  id: number;
  name: string;
  title: string;
  location: string;
  email: string;
  bio: string;
  avatarUrl?: string;
  skills: string[];
  experience: Array<{
    id: number;
    title: string;
    company: string;
    startDate: string;
    endDate: string;
    description: string;
  }>;
  education: Array<{
    id: number;
    school: string;
    degree: string;
    field: string;
    startDate: string;
    endDate: string;
  }>;
  social: {
    linkedin?: string;
    github?: string;
    twitter?: string;
    website?: string;
  };
  contact: {
    email: string;
    phone?: string;
  };
  connectionsCount: number;
  mutualConnections: number;
}

// Mock profile and activity data to simulate backend responses
let mockProfile: ProfileData = {
  id: 1,
  name: 'Alex Johnson',
  title: 'Senior Frontend Engineer',
  location: 'San Francisco, CA',
  email: 'alex.johnson@example.com',
  bio: 'Passionate about building delightful user experiences and scalable design systems.',
  avatarUrl: 'https://avatars.githubusercontent.com/u/1?v=4',
  skills: ['React', 'TypeScript', 'Tailwind CSS', 'Node.js', 'UX'],
  experience: [
    {
      id: 1,
      title: 'Senior Frontend Engineer',
      company: 'TechCorp',
      startDate: '2021-01',
      endDate: 'Present',
      description: 'Leading the frontend team and driving UI architecture decisions.'
    },
    {
      id: 2,
      title: 'Frontend Engineer',
      company: 'StartupX',
      startDate: '2018-06',
      endDate: '2020-12',
      description: 'Built and maintained core product features with React and TypeScript.'
    }
  ],
  education: [
    {
      id: 1,
      school: 'State University',
      degree: 'B.Sc.',
      field: 'Computer Science',
      startDate: '2013-09',
      endDate: '2017-06'
    }
  ],
  social: {
    linkedin: 'https://linkedin.com/in/example',
    github: 'https://github.com/example',
    twitter: 'https://twitter.com/example',
    website: 'https://example.dev'
  },
  contact: {
    email: 'alex.johnson@example.com',
    phone: '+1 (555) 123-4567'
  },
  connectionsCount: 428,
  mutualConnections: 24
};

let mockActivity: ActivityItem[] = [
  {
    id: 1,
    type: 'post',
    title: 'Shared an article on design systems',
    description: '“Scaling Design Systems in Large Organizations”',
    date: '2026-02-21'
  },
  {
    id: 2,
    type: 'connection',
    title: 'Connected with Jamie Lee',
    description: 'Product Designer at CreativeLab',
    date: '2026-02-19'
  },
  {
    id: 3,
    type: 'interaction',
    title: 'Commented on a post',
    description: '“Great insights on performance optimization!”',
    date: '2026-02-17'
  }
];

const simulateDelay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const profileApi = {
  getProfile: async (): Promise<ProfileData> => {
    await simulateDelay(400);
    return mockProfile;
  },

  getActivity: async (): Promise<ActivityItem[]> => {
    await simulateDelay(400);
    return mockActivity;
  },

  updateProfile: async (
    updated: Partial<ProfileData>
  ): Promise<ProfileData> => {
    await simulateDelay(600);
    mockProfile = { ...mockProfile, ...updated };
    return mockProfile;
  },

  updateActivity: async (
    updated: ActivityItem[]
  ): Promise<ActivityItem[]> => {
    await simulateDelay(500);
    mockActivity = updated;
    return mockActivity;
  }
};