import React from 'react';
import { Users } from 'lucide-react';

const LandingAbout: React.FC = () => {
  const teamMembers = [
    {
      name: "Adebayo Ogunlesi",
      role: "Founder & CEO",
      bio: "Former software engineer with experience studying abroad in the UK. Passionate about making international education accessible to Nigerian students.",
      image: "https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2"
    },
    {
      name: "Ngozi Okafor",
      role: "Head of Education",
      bio: "Education consultant with 8+ years of experience helping Nigerian students secure admissions and scholarships abroad.",
      image: "https://images.pexels.com/photos/3769021/pexels-photo-3769021.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2"
    },
    {
      name: "Oluwaseun Adeyemi",
      role: "AI Lead",
      bio: "AI researcher with a PhD from MIT. Specializes in natural language processing and recommendation systems.",
      image: "https://images.pexels.com/photos/2381069/pexels-photo-2381069.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2"
    }
  ];

  return (
    <section className="py-16 md:py-24" id="about">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">About Akada</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We're on a mission to democratize access to global tech education for Nigerian students.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Story</h3>
            <p className="text-gray-600 mb-4">
              Akada was born from our founder's personal struggle with the international application process. 
              After experiencing the confusion, stress, and lack of guidance firsthand, he decided to build 
              the solution he wished he had.
            </p>
            <p className="text-gray-600 mb-4">
              The name "Akada" comes from the Yoruba word for student or scholar, reflecting our deep 
              connection to Nigerian education and our commitment to helping Nigerian students achieve 
              their academic dreams globally.
            </p>
            <p className="text-gray-600">
              Today, we're proud to be Nigeria's first AI-powered platform dedicated to helping students 
              navigate the complex journey to international tech education.
            </p>
          </div>
          <div className="bg-indigo-600 rounded-xl p-8 text-white">
            <div className="flex items-center mb-6">
              <Users className="h-10 w-10 mr-4" />
              <h3 className="text-2xl font-bold">Our Mission</h3>
            </div>
            <p className="text-lg mb-4">
              To empower Nigerian students with the tools, information, and guidance they need to 
              access world-class technology education globally.
            </p>
            <p className="text-lg mb-4">
              We believe that talent is universal, but opportunity is not. Our platform bridges this 
              gap by making the international application process transparent, accessible, and 
              achievable for Nigerian students.
            </p>
            <p className="text-lg">
              By 2025, we aim to help 10,000 Nigerian students secure admissions to top tech programs worldwide.
            </p>
          </div>
        </div>

        <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Meet Our Team</h3>
        <div className="grid md:grid-cols-3 gap-8">
          {teamMembers.map((member, index) => (
            <div key={index} className="bg-white rounded-xl shadow-md p-6 text-center">
              <img 
                src={member.image} 
                alt={member.name} 
                className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
              />
              <h4 className="text-xl font-bold text-gray-900">{member.name}</h4>
              <p className="text-indigo-600 mb-4">{member.role}</p>
              <p className="text-gray-600">{member.bio}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LandingAbout;