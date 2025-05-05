import React, { useState } from 'react';
import { Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';

interface AppDrawerButtonProps {
  onAuthClick: () => void;
}
  
const AppDrawerButton: React.FC<AppDrawerButtonProps> = ({ onAuthClick }) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/dashboard');
  };

  return (
    <>
      <Button 
        onClick={handleClick}
        className="fixed bottom-6 right-6 z-30 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg p-4 flex items-center gap-2"
      >
        <Menu className="h-5 w-5" />
        <span>Demo App</span>
      </Button>
    </>
  );
};

export default AppDrawerButton;