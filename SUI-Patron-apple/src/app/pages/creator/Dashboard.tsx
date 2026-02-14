import React from "react";
import { Link } from "react-router-dom";
import {
  DollarSign,
  Users,
  TrendingUp,
  Download,
  Plus,
  Clock,
  Eye,
  MoreHorizontal,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, Button, Badge, cn } from "../../components/ui/Shared";
import { MOCK_POSTS, MOCK_CREATORS } from "../../mockData";

const CHART_DATA = [
  { name: "Mon", value: 400 },
  { name: "Tue", value: 300 },
  { name: "Wed", value: 600 },
  { name: "Thu", value: 800 },
  { name: "Fri", value: 500 },
  { name: "Sat", value: 900 },
  { name: "Sun", value: 1200 },
];

export function CreatorDashboard() {
  const [activeTab, setActiveTab] = React.useState<"content" | "supporters">(
    "content",
  );

  // Mock current creator context
  const creator = MOCK_CREATORS[0];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500">Welcome back, {creator.name}</p>
        </div>
        <div className="flex space-x-3">
          <Link to="/creator/withdraw">
            <Button variant="outline">
              <DollarSign className="w-4 h-4 mr-2" /> Withdraw
            </Button>
          </Link>
          <Link to="/creator/upload">
            <Button>
              <Plus className="w-4 h-4 mr-2" /> New Post
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Available Balance"
          value={`$${creator.totalEarnings.toLocaleString()}`}
          change="+12.5%"
          icon={DollarSign}
        />
        <StatsCard
          title="Active Supporters"
          value={creator.supporterCount.toLocaleString()}
          change="+5.2%"
          icon={Users}
        />
        <StatsCard
          title="Monthly Views"
          value="45.2k"
          change="+28.4%"
          icon={Eye}
        />
      </div>

      {/* Chart */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-gray-900">Earnings Overview</h3>
          <select className="text-sm border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>This Year</option>
          </select>
        </div>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={CHART_DATA}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f3f4f6"
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#6b7280", fontSize: 12 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#6b7280", fontSize: 12 }}
                tickFormatter={(val) => `$${val}`}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "8px",
                  border: "none",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                }}
                cursor={{ stroke: "#4f46e5", strokeWidth: 1 }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#4f46e5"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorValue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Content & Supporters Tabs */}
      <div className="space-y-4">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("content")}
              className={cn(
                "whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm",
                activeTab === "content"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300",
              )}
            >
              Content Management
            </button>
            <button
              onClick={() => setActiveTab("supporters")}
              className={cn(
                "whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm",
                activeTab === "supporters"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300",
              )}
            >
              Recent Supporters
            </button>
          </nav>
        </div>

        {activeTab === "content" && (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Content
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Access
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stats
                    </th>
                    <th className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {MOCK_POSTS.map((post) => (
                    <tr key={post.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <img
                              className="h-10 w-10 rounded-md object-cover"
                              src={post.thumbnail}
                              alt=""
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {post.title}
                            </div>
                            <div className="text-xs text-gray-500 capitalize">
                              {post.type}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant="success">Published</Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {post.accessLevel === "premium" ? (
                          <Badge variant="premium">Premium</Badge>
                        ) : (
                          <Badge>Free</Badge>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(post.publishedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex space-x-3">
                          <span className="flex items-center">
                            <Eye className="w-3 h-3 mr-1" /> 1.2k
                          </span>
                          <span className="flex items-center">
                            <DollarSign className="w-3 h-3 mr-1" /> $450
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button className="text-gray-400 hover:text-gray-500">
                          <MoreHorizontal className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {activeTab === "supporters" && (
          <Card>
            <div className="p-8 text-center text-gray-500">
              <Users className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p>Supporter list would appear here.</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

function StatsCard({ title, value, change, icon: Icon }: any) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className="p-3 bg-indigo-50 rounded-lg">
          <Icon className="w-6 h-6 text-indigo-600" />
        </div>
      </div>
      <div className="mt-4 flex items-center text-sm">
        <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
        <span className="text-green-600 font-medium">{change}</span>
        <span className="text-gray-400 ml-2">from last month</span>
      </div>
    </Card>
  );
}
