export interface Post {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  authorName: string;
  authorRole: string;
  authorImage: string;
  coverImage: string;
  readingTime: string;
  publishedAt: string;
  status: 'draft' | 'published';
  views: number;
}

export interface UserProfile {
  uid: string;
  email: string;
  role: 'admin' | 'editor';
  displayName: string;
}
