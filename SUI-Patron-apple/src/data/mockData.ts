export interface Creator {
  id: string;
  name: string;
  suins: string;
  avatar?: string;
  bio: string;
  price: number;
  supporterCount: number;
  postCount: number;
  joinedDate: string;
}

export interface Content {
  id: string;
  creatorId: string;
  title: string;
  description: string;
  type: "IMG" | "TXT" | "PDF";
  thumbnail?: string; // For images
  createdAt: string;
  isLocked: boolean; // Computed on frontend based on access
}

export interface User {
  address: string;
  email: string;
  balance: number;
  suins?: string;
  ownedPasses: string[]; // List of creator IDs
}

export const MOCK_USER: User = {
  address: "0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p",
  email: "demo@suipatron.sui",
  balance: 125.5,
  suins: "@demo.suipatron",
  ownedPasses: [], // Starts empty for demo flow
};

export const MOCK_CREATORS: Creator[] = [
  {
    id: "c1",
    name: "Elena Art",
    suins: "@elena.suipatron",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80",
    bio: "Digital artist creating ethereal landscapes and character concepts. Support me to get high-res wallpapers and process videos.",
    price: 5,
    supporterCount: 23,
    postCount: 12,
    joinedDate: "Dec 2023",
  },
  {
    id: "c2",
    name: "Dev DAO",
    suins: "@devdao.suipatron",
    avatar:
      "https://images.unsplash.com/photo-1522075469751-3a3694c60e9e?auto=format&fit=crop&w=256&q=80",
    bio: "We build open source tools for the SUI ecosystem. Access our private research and architecture diagrams.",
    price: 10,
    supporterCount: 45,
    postCount: 30,
    joinedDate: "Jan 2024",
  },
  {
    id: "c3",
    name: "Alex Write",
    suins: "@alex.suipatron",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80",
    bio: "Deep dives into Web3 economics. Weekly essays and investment thesis.",
    price: 2,
    supporterCount: 8,
    postCount: 5,
    joinedDate: "Feb 2024",
  },
];

export const MOCK_CONTENT: Content[] = [
  {
    id: "p1",
    creatorId: "c1",
    title: "Neon Cityscape - 4K Wallpaper",
    description:
      "Full resolution export of my latest piece. Free for personal use.",
    type: "IMG",
    thumbnail:
      "https://images.unsplash.com/photo-1555680202-c86f0e12f086?auto=format&fit=crop&w=800&q=80",
    createdAt: "2 hours ago",
    isLocked: true,
  },
  {
    id: "p2",
    creatorId: "c1",
    title: "Character Study: The Rogue",
    description: "Sketches and final render process.",
    type: "PDF",
    createdAt: "1 day ago",
    isLocked: true,
  },
  {
    id: "p3",
    creatorId: "c1",
    title: "Brush Pack v2",
    description: "My custom Procreate brushes for inking.",
    type: "TXT",
    createdAt: "3 days ago",
    isLocked: true,
  },
  // Dev DAO content
  {
    id: "p4",
    creatorId: "c2",
    title: "Q1 Roadmap",
    description: "Internal planning document for the next quarter.",
    type: "TXT",
    createdAt: "5 hours ago",
    isLocked: true,
  },
  {
    id: "p5",
    creatorId: "c2",
    title: "Architecture Diagram: Indexer",
    description: "High level overview of our new indexer.",
    type: "IMG",
    thumbnail:
      "https://images.unsplash.com/photo-1558494949-ef526b0042a0?auto=format&fit=crop&w=800&q=80",
    createdAt: "1 week ago",
    isLocked: true,
  },
];
