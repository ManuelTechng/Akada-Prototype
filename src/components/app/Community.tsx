import React, { useState } from 'react';
import {
  Users,
  MessageSquare,
  Calendar,
  Award,
  BookOpen,
  Globe,
  Mail,
  Twitter,
  Linkedin,
  Github,
  Star,
  Heart,
  Share2,
  Search,
  Filter,
  ChevronRight,
  ArrowRight,
  MapPin,
  GraduationCap,
  CheckCircle,
  X
} from 'lucide-react';

interface CommunityProps {}

const Community: React.FC<CommunityProps> = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'discussions' | 'events' | 'members'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  const featuredMembers = [
    {
      name: "Chioma Okonkwo",
      role: "MSc AI Student @ University of Toronto",
      image: "https://images.pexels.com/photos/3769021/pexels-photo-3769021.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2",
      contribution: "Discussion Leader",
      testimonial: "The support from this community helped me secure a fully-funded position at UofT. Now I'm helping others do the same!",
      badges: ["Top Contributor", "Mentor", "AI Specialist"]
    },
    {
      name: "Oluwaseun Adebayo",
      role: "Software Engineer @ Microsoft",
      image: "https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2",
      contribution: "Technical Mentor",
      testimonial: "From Lagos to Seattle - this community was instrumental in my journey. The mock interviews and resume reviews were invaluable.",
      badges: ["Career Guide", "Technical Expert"]
    },
    {
      name: "Amina Ibrahim",
      role: "PhD Student @ ETH Zurich",
      image: "https://images.pexels.com/photos/3772509/pexels-photo-3772509.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2",
      contribution: "Research Advisor",
      testimonial: "Found my research collaborators here! The academic support network is incredible for aspiring researchers.",
      badges: ["Research Pro", "Scholarship Guide"]
    }
  ];

  const upcomingEvents = [
    {
      title: "Virtual Graduate School Fair",
      date: "May 15, 2024",
      time: "2:00 PM WAT",
      type: "Online Event",
      description: "Connect with admissions officers from top tech universities worldwide.",
      attendees: 234
    },
    {
      title: "Statement of Purpose Workshop",
      date: "May 20, 2024",
      time: "4:00 PM WAT",
      type: "Workshop",
      description: "Learn how to craft a compelling SOP with feedback from successful applicants.",
      attendees: 156
    },
    {
      title: "Tech Interview Prep Session",
      date: "May 25, 2024",
      time: "3:00 PM WAT",
      type: "Workshop",
      description: "Practice technical interviews with engineers from FAANG companies.",
      attendees: 189
    }
  ];

  const discussionTopics = [
    {
      title: "Scholarship Application Tips",
      category: "Funding",
      posts: 156,
      lastActive: "2 hours ago",
      hot: true
    },
    {
      title: "CS Masters vs Direct PhD?",
      category: "Academic Advice",
      posts: 89,
      lastActive: "4 hours ago",
      hot: false
    },
    {
      title: "Living in Toronto as a Student",
      category: "Student Life",
      posts: 234,
      lastActive: "1 hour ago",
      hot: true
    }
  ];

  const communityStats = [
    { label: "Active Members", value: "2,500+" },
    { label: "Countries", value: "25+" },
    { label: "Success Stories", value: "500+" },
    { label: "Monthly Events", value: "20+" }
  ];

  const handleTabChange = (tab: 'all' | 'discussions' | 'events' | 'members') => {
    console.log(`Switching to "${tab}" tab`);
    setActiveTab(tab);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-8 mb-12 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 font-heading">
            Welcome to the Akada Community
          </h1>
          <p className="text-xl text-indigo-100 mb-8 max-w-2xl">
            Join a thriving network of Nigerian students and professionals pursuing global tech education. Share experiences, get guidance, and help others succeed.
          </p>
          <div className="flex flex-wrap gap-8 text-center">
            {communityStats.map((stat, index) => (
              <div key={index}>
                <div className="text-3xl font-bold mb-1">{stat.value}</div>
                <div className="text-indigo-200">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-6">
          <div className="relative flex-1 w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search discussions, events, or members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleTabChange('all')}
              className={`px-4 py-2 rounded-lg ${
                activeTab === 'all'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => handleTabChange('discussions')}
              className={`px-4 py-2 rounded-lg ${
                activeTab === 'discussions'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Discussions
            </button>
            <button
              onClick={() => handleTabChange('events')}
              className={`px-4 py-2 rounded-lg ${
                activeTab === 'events'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Events
            </button>
            <button
              onClick={() => handleTabChange('members')}
              className={`px-4 py-2 rounded-lg ${
                activeTab === 'members'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Members
            </button>
          </div>
        </div>
      </div>

      {/* Featured Members */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 font-heading">Featured Members</h2>
          <button className="text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
            View All Members
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {featuredMembers.map((member, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-start gap-4 mb-4">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div>
                  <h3 className="font-medium text-gray-900">{member.name}</h3>
                  <p className="text-sm text-gray-500">{member.role}</p>
                  <div className="flex gap-1 mt-2">
                    {member.badges.map((badge, badgeIndex) => (
                      <span
                        key={badgeIndex}
                        className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs"
                      >
                        {badge}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                "{member.testimonial}"
              </p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-indigo-600 font-medium">
                  {member.contribution}
                </span>
                <button className="text-gray-400 hover:text-indigo-600 transition-colors">
                  <MessageSquare className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming Events */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 font-heading">Upcoming Events</h2>
          <button className="text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
            View All Events
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {upcomingEvents.map((event, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-2 text-sm text-indigo-600 mb-3">
                <Calendar className="h-4 w-4" />
                <span>{event.date} • {event.time}</span>
              </div>
              <h3 className="font-medium text-gray-900 mb-2">{event.title}</h3>
              <p className="text-gray-600 text-sm mb-4">{event.description}</p>
              <div className="flex justify-between items-center">
                <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-sm">
                  {event.type}
                </span>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Users className="h-4 w-4" />
                  <span>{event.attendees} attending</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Popular Discussions */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 font-heading">Popular Discussions</h2>
          <button className="text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
            View All Discussions
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-4">
          {discussionTopics.map((topic, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-medium text-gray-900">{topic.title}</h3>
                    {topic.hot && (
                      <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-xs">
                        Hot
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="bg-gray-100 px-2 py-1 rounded-full">
                      {topic.category}
                    </span>
                    <span>{topic.posts} posts</span>
                    <span>Last active {topic.lastActive}</span>
                  </div>
                </div>
                <button className="text-indigo-600 hover:text-indigo-700">
                  <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Community Guidelines */}
      <div className="bg-gradient-to-br from-gray-50 to-indigo-50 rounded-2xl p-8 mb-12">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 font-heading">Community Guidelines</h2>
          <p className="text-gray-600 mb-8">
            Our community thrives on mutual respect, support, and collaboration. We expect all members to:
          </p>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 text-left">
              <h3 className="font-medium text-gray-900 mb-3">Do's</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Share knowledge and experiences</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Be respectful and supportive</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Provide constructive feedback</span>
                </li>
              </ul>
            </div>
            <div className="bg-white rounded-xl p-6 text-left">
              <h3 className="font-medium text-gray-900 mb-3">Don'ts</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center gap-2">
                  <X className="h-5 w-5 text-red-500" />
                  <span>Share personal information</span>
                </li>
                <li className="flex items-center gap-2">
                  <X className="h-5 w-5 text-red-500" />
                  <span>Engage in harassment</span>
                </li>
                <li className="flex items-center gap-2">
                  <X className="h-5 w-5 text-red-500" />
                  <span>Spam or self-promote</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Get Involved */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 font-heading">Get Involved</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            There are many ways to contribute to our community. Choose the role that best fits your interests and expertise.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-indigo-50 rounded-xl p-6">
            <div className="bg-indigo-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <MessageSquare className="h-6 w-6 text-indigo-600" />
            </div>
            <h3 className="font-medium text-gray-900 mb-2">Discussion Leader</h3>
            <p className="text-gray-600 text-sm mb-4">
              Start and moderate discussions on topics you're knowledgeable about.
            </p>
            <button className="text-indigo-600 text-sm font-medium">Learn More →</button>
          </div>
          <div className="bg-purple-50 rounded-xl p-6">
            <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-medium text-gray-900 mb-2">Mentor</h3>
            <p className="text-gray-600 text-sm mb-4">
              Guide others through their application journey with your experience.
            </p>
            <button className="text-purple-600 text-sm font-medium">Learn More →</button>
          </div>
          <div className="bg-blue-50 rounded-xl p-6">
            <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-medium text-gray-900 mb-2">Event Organizer</h3>
            <p className="text-gray-600 text-sm mb-4">
              Plan and host virtual events, workshops, or study groups.
            </p>
            <button className="text-blue-600 text-sm font-medium">Learn More →</button>
          </div>
          <div className="bg-green-50 rounded-xl p-6">
            <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Award className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-medium text-gray-900 mb-2">Content Creator</h3>
            <p className="text-gray-600 text-sm mb-4">
              Share your knowledge through guides, tutorials, or blog posts.
            </p>
            <button className="text-green-600 text-sm font-medium">Learn More →</button>
          </div>
        </div>
      </div>

      {/* Connect With Us */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 font-heading">Connect With Us</h2>
          <p className="text-gray-600">
            Follow us on social media and join our channels to stay updated with the latest community activities.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <a
            href="#"
            className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-indigo-200 hover:bg-indigo-50 transition-colors"
          >
            <Mail className="h-6 w-6 text-gray-400" />
            <div className="text-left">
              <div className="font-medium text-gray-900">Newsletter</div>
              <div className="text-sm text-gray-500">Weekly updates</div>
            </div>
          </a>
          <a
            href="#"
            className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-blue-200 hover:bg-blue-50 transition-colors"
          >
            <Twitter className="h-6 w-6 text-gray-400" />
            <div className="text-left">
              <div className="font-medium text-gray-900">Twitter</div>
              <div className="text-sm text-gray-500">@AkadaHQ</div>
            </div>
          </a>
          <a
            href="#"
            className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-blue-200 hover:bg-blue-50 transition-colors"
          >
            <Linkedin className="h-6 w-6 text-gray-400" />
            <div className="text-left">
              <div className="font-medium text-gray-900">LinkedIn</div>
              <div className="text-sm text-gray-500">Akada Community</div>
            </div>
          </a>
          <a
            href="#"
            className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-gray-400 hover:bg-gray-50 transition-colors"
          >
            <Github className="h-6 w-6 text-gray-400" />
            <div className="text-left">
              <div className="font-medium text-gray-900">GitHub</div>
              <div className="text-sm text-gray-500">Open Source</div>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Community;