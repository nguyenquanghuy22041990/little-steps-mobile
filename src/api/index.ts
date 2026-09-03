import { apiClient } from './client';


export interface Journey {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
}

export interface Child {
  id: string;
  journey_id: string;
  name: string;
  birthday: string;
  avatar_storage_key?: string;
}

export interface Milestone {
  id: string;
  journey_id: string;
  title: string;
  description?: string;
  occurred_at: string;
  memories?: Memory[];
}

export interface Memory {
  id: string;
  milestone_id: string;
  title: string;
  description?: string;
  occurred_at: string;
  media?: Media[];
}

export interface Media {
  id: string;
  memory_id: string;
  type: 'PHOTO' | 'VIDEO';
  storage_key: string;
}

export const createJourney = async (title: string): Promise<Journey> => {
  const response = await apiClient.post('/journeys', {
    title,
  });
  return response.data;
};

export const createChild = async (journey_id: string, name: string, birthday: string): Promise<Child> => {
  const response = await apiClient.post('/children', {
    journey_id,
    name,
    birthday,
  });
  return response.data;
};

export const getJourneys = async (): Promise<Journey[]> => {
  const response = await apiClient.get('/journeys');
  return response.data;
};

export const getChildren = async (journey_id: string): Promise<Child[]> => {
  const response = await apiClient.get(`/children?journey_id=${journey_id}`);
  return response.data;
};

export const getMilestones = async (journeyId: string): Promise<Milestone[]> => {
  const response = await apiClient.get('/milestones', { params: { journey_id: journeyId } });
  return response.data;
};

export const deleteMilestone = async (id: string): Promise<void> => {
  await apiClient.delete(`/milestones/${id}`);
};

export const updateMilestone = async (id: string, data: any): Promise<any> => {
  const response = await apiClient.patch(`/milestones/${id}`, data);
  return response.data;
};

export const updateMemory = async (id: string, data: any): Promise<any> => {
  const response = await apiClient.patch(`/memories/${id}`, data);
  return response.data;
};

export const deleteMedia = async (id: string): Promise<void> => {
  await apiClient.delete(`/media/${id}`);
};

export const updateChild = async (id: string, data: any): Promise<Child> => {
  const response = await apiClient.patch(`/children/${id}`, data);
  return response.data;
};
