import {
  Plus,
  Check,
  Lock,
  Video,
  Image,
  FileText,
  Mic,
  Globe,
  Instagram,
  Twitter,
  Youtube,
} from "lucide-react";

export interface User {
  id: string;
  name: string;
  avatar: string;
  role: "creator" | "subscriber";
  bio?: string;
  walletBalance?: number;
}

export interface Creator extends User {
  coverImage: string;
  category: string;
  tags: string[];
  links: { label: string; url: string; icon: any }[];
  supporterCount: number;
  monthlyEarnings: number;
  totalEarnings: number;
  accessPassPrice: number;
  accessPassBenefits: string[];
}

export interface Post {
  id: string;
  creatorId: string;
  title: string;
  description: string;
  thumbnail: string;
  type: "video" | "image" | "audio" | "document" | "post";
  accessLevel: "free" | "premium";
  publishedAt: string;
  likes: number;
  comments: number;
}

export interface AccessPass {
  id: string;
  creatorId: string;
  purchaseDate: string;
  expiryDate: string;
  status: "active" | "expired";
  benefits: string[];
  nftImageUrl: string;
}

export const CURRENT_USER: User = {
  id: "u1",
  name: "Alex Doe",
  avatar:
    "https://images.unsplash.com/photo-1595745688820-1a8bca9dd00f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3J0cmFpdCUyMGNyZWF0aXZlJTIwcGVyc29ufGVufDF8fHx8MTc3MDk4NDk1Nnww&ixlib=rb-4.1.0&q=80&w=1080",
  role: "creator", // Can toggle this in app state
  walletBalance: 1250.5,
};

export const MOCK_CREATORS: Creator[] = [
  {
    id: "c1",
    name: "Elena Design",
    avatar:
      "https://images.unsplash.com/photo-1595745688820-1a8bca9dd00f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3J0cmFpdCUyMGNyZWF0aXZlJTIwcGVyc29ufGVufDF8fHx8MTc3MDk4NDk1Nnww&ixlib=rb-4.1.0&q=80&w=1080",
    coverImage:
      "https://images.unsplash.com/photo-1759074558550-dcca42849e36?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBkaWdpdGFsJTIwYXJ0JTIwYWJzdHJhY3QlMjBiYWNrZ3JvdW5kfGVufDF8fHx8MTc3MTAyNzA0Nnww&ixlib=rb-4.1.0&q=80&w=1080",
    role: "creator",
    bio: "Creating digital art and tutorials for aspiring designers.",
    category: "Design",
    tags: ["3D Art", "Tutorials", "Blender"],
    links: [
      { label: "Website", url: "#", icon: Globe },
      { label: "Instagram", url: "#", icon: Instagram },
    ],
    supporterCount: 1205,
    monthlyEarnings: 5400,
    totalEarnings: 125000,
    accessPassPrice: 15,
    accessPassBenefits: ["Weekly Tutorials", "Source Files", "Discord Access"],
  },
  {
    id: "c2",
    name: "Tech Insider",
    avatar:
      "https://images.unsplash.com/photo-1574576839798-00b48241d0b6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aWRlbyUyMGNvbnRlbnQlMjBjcmVhdGlvbiUyMGNhbWVyYXxlbnwxfHx8fDE3NzEwMjcwNDZ8MA&ixlib=rb-4.1.0&q=80&w=1080",
    coverImage:
      "https://images.unsplash.com/photo-1741466072239-fafcc7052467?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3p5JTIwd29ya3NwYWNlJTIwY3JlYXRvciUyMGRlc2t8ZW58MXx8fHwxNzcxMDI3MDQ2fDA&ixlib=rb-4.1.0&q=80&w=1080",
    role: "creator",
    bio: "Deep dives into the latest tech and gadgets.",
    category: "Technology",
    tags: ["Reviews", "Tech", "Unboxing"],
    links: [{ label: "Twitter", url: "#", icon: Twitter }],
    supporterCount: 890,
    monthlyEarnings: 3200,
    totalEarnings: 45000,
    accessPassPrice: 5,
    accessPassBenefits: ["Early Access", "Exclusive Q&A"],
  },
];

export const MOCK_POSTS: Post[] = [
  {
    id: "p1",
    creatorId: "c1",
    title: "Mastering Lighting in Blender",
    description: "In this tutorial, we go over the 3-point lighting setup...",
    thumbnail:
      "https://images.unsplash.com/photo-1705321963943-de94bb3f0dd3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pbWFsaXN0JTIwaW50ZXJpb3IlMjBkZXNpZ258ZW58MXx8fHwxNzcxMDAzMjI5fDA&ixlib=rb-4.1.0&q=80&w=1080",
    type: "video",
    accessLevel: "free",
    publishedAt: "2023-10-25T10:00:00Z",
    likes: 120,
    comments: 45,
  },
  {
    id: "p2",
    creatorId: "c1",
    title: "Project Files: Neon City",
    description: "Download the full project files for the Neon City scene.",
    thumbnail:
      "https://images.unsplash.com/photo-1759074558550-dcca42849e36?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBkaWdpdGFsJTIwYXJ0JTIwYWJzdHJhY3QlMjBiYWNrZ3JvdW5kfGVufDF8fHx8MTc3MTAyNzA0Nnww&ixlib=rb-4.1.0&q=80&w=1080",
    type: "document",
    accessLevel: "premium",
    publishedAt: "2023-10-26T14:30:00Z",
    likes: 85,
    comments: 12,
  },
  {
    id: "p3",
    creatorId: "c2",
    title: "iPhone 16 - First Impressions",
    description: "My honest thoughts after 24 hours with the new device.",
    thumbnail:
      "https://images.unsplash.com/photo-1574576839798-00b48241d0b6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aWRlbyUyMGNvbnRlbnQlMjBjcmVhdGlvbiUyMGNhbWVyYXxlbnwxfHx8fDE3NzEwMjcwNDZ8MA&ixlib=rb-4.1.0&q=80&w=1080",
    type: "video",
    accessLevel: "free",
    publishedAt: "2023-10-27T09:15:00Z",
    likes: 540,
    comments: 200,
  },
];

export const MOCK_PASSES: AccessPass[] = [
  {
    id: "pass1",
    creatorId: "c1",
    purchaseDate: "2023-09-15",
    expiryDate: "2023-10-15",
    status: "active",
    benefits: ["Weekly Tutorials", "Source Files"],
    nftImageUrl:
      "https://images.unsplash.com/photo-1633176640669-44bd6adaa662?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHwzZCUyMGJhZGdlJTIwZ29sZCUyMHNoaW55fGVufDF8fHx8MTc3MTAyNzA0Nnww&ixlib=rb-4.1.0&q=80&w=1080",
  },
];
