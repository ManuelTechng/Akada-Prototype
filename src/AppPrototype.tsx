@@ .. @@
   const [isDrawerOpen, setIsDrawerOpen] = useState(false);
   const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
   const { unreadCount } = useNotifications();
+  const navigate = useNavigate();
 
   const toggleSidebar = () => setIsDrawerOpen(!isDrawerOpen);
 
@@ .. @@
             <GraduationCap className="h-8 w-8 text-indigo-600" />
             <span className="font-bold text-xl text-gray-900 font-heading">Akada</span>
           </div>
+          <button
+            onClick={() => navigate('/')}
+            className="text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-2 ml-4"
+          >
+            <Home className="h-5 w-5" />
+            <span>Back to Landing Page</span>
+          </button>
           <button 
             className="lg:hidden p-2 rounded-md hover:bg-gray-100"
             onClick={toggleSidebar}