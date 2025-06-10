import { useState, useEffect } from "react";
import { getUsers, createConnection, getUserConnections, getUserData } from "@/lib/firebase-update";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, UserPlus, Users as UsersIcon, Star, User as UserIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

interface User {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  coins?: number;
  recommendationsCount?: number;
  rating?: number;
  connectionsCount?: number;
  isConnected?: boolean;
}

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [connectingUsers, setConnectingUsers] = useState<Set<string>>(new Set());
  const [myConnectionsCount, setMyConnectionsCount] = useState(0);
  const [myConnections, setMyConnections] = useState<string[]>([]);
  const [myUserData, setMyUserData] = useState<any>(null);
  
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    async function fetchUsers() {
      try {
        const usersData = await getUsers();
        let processedUsers = usersData
          .filter((u: any) => u.uid !== user?.uid) // סינון המשתמש הנוכחי
          .map((u: any) => ({
            uid: u.uid,
            displayName: u.displayName || "משתמש",
            email: u.email,
            photoURL: u.photoURL,
            coins: u.coins || 0,
            recommendationsCount: u.recommendationsCount || 0,
            connectionsCount: u.connectionsCount || 0,
            isConnected: false
          }));
        setUsers(processedUsers);
        setFilteredUsers(processedUsers);
        // Fetch my user data for rating
        if (user?.uid) {
          const myData = await getUserData(user.uid);
          setMyUserData(myData);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        toast({
          title: "שגיאה",
          description: "לא ניתן לטעון את רשימת המשתמשים",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    }
    if (user) {
      fetchUsers();
    }
  }, [user, toast]);

  useEffect(() => {
    async function fetchConnections() {
      if (user?.uid) {
        const connections = await getUserConnections(user.uid);
        setMyConnections(connections);
        setMyConnectionsCount(connections.length);
      }
    }
    fetchConnections();
  }, [user]);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(u => 
        u.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [searchTerm, users]);

  const handleConnect = async (targetUserId: string) => {
    // נסה לקבל את המשתמש מ-user או מ-localStorage
    let currentUser = user;
    if (!currentUser) {
      const storedUser = localStorage.getItem('authUser');
      if (storedUser) {
        try {
          currentUser = JSON.parse(storedUser);
        } catch (e) {
          console.error("שגיאה בפענוח נתוני משתמש:", e);
          return;
        }
      }
    }
    
    if (!currentUser) {
      toast({
        title: "שגיאה",
        description: "יש להתחבר כדי ליצור חיבור",
        variant: "destructive",
      });
      return;
    }
    
    setConnectingUsers(prev => new Set(prev).add(targetUserId));
    
    try {
      await createConnection(currentUser.uid, targetUserId);
      
      // עדכן את המצב המקומי מיד - שנה את הכפתור לירוק
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.uid === targetUserId 
            ? { ...user, isConnected: true }
            : user
        )
      );
      
      setFilteredUsers(prevUsers => 
        prevUsers.map(user => 
          user.uid === targetUserId 
            ? { ...user, isConnected: true }
            : user
        )
      );
      
      // עדכן את מספר החיבורים
      setMyConnectionsCount(prev => prev + 1);
    } catch (error) {
      console.error("Error creating connection:", error);
      toast({
        title: "שגיאה",
        description: "לא ניתן לשלוח בקשת חיבור",
        variant: "destructive"
      });
    } finally {
      setConnectingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(targetUserId);
        return newSet;
      });
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="text-center bg-white dark:bg-gray-800 rounded-xl p-8 shadow-md">
          <h2 className="text-2xl font-bold mb-4">נדרש להתחבר</h2>
          <p className="text-gray-600 dark:text-gray-400">
            כדי לראות משתמשים אחרים, אתה צריך להתחבר תחילה
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-6">
      {/* כותרת וחיפוש */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-8 shadow-lg">
        <div className="flex flex-col md:flex-row-reverse md:justify-between md:items-center gap-4">
          <div className="relative w-full md:w-1/3">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
            <Input
              type="text"
              placeholder="חפש משתמשים..."
              className="pr-10 text-left"
              style={{ direction: "rtl", textAlign: "left" }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex-1 text-right">
            <h1 className="text-3xl font-bold mb-2">משתמשים</h1>
            <p className="text-gray-600 dark:text-gray-400">
              התחבר עם אנשים אחרים וקבל המלצות מותאמות אישית
            </p>
          </div>
        </div>
      </div>

      {/* סטטיסטיקות */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="text-center p-6">
          <UsersIcon className="h-12 w-12 text-blue-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold">{users.length}</h3>
          <p className="text-gray-600 dark:text-gray-400">משתמשים רשומים</p>
        </Card>
        
        <Card className="text-center p-6">
          <UserPlus className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold">{myConnectionsCount}</h3>
          <p className="text-gray-600 dark:text-gray-400">החיבורים שלי</p>
        </Card>
        
        <Card className="text-center p-6">
          <Star className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold">{myUserData && myUserData.rating !== undefined ? myUserData.rating.toFixed(1) : "0.0"}</h3>
          <p className="text-gray-600 dark:text-gray-400">דירוג ממוצע</p>
        </Card>
      </div>

      {/* רשימת משתמשים */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-16 w-16 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded mt-4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredUsers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((userData) => {
            const isConnected = myConnections.includes(userData.uid);
            return (
              <Card key={userData.uid} className="hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <Avatar className="h-16 w-16 ring-2 ring-gray-100 dark:ring-gray-700">
                      <AvatarImage src={userData.photoURL} />
                      <AvatarFallback className="text-lg">
                        {userData.displayName.slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 text-right">
                      <h3 className="text-lg font-semibold mb-1">
                        {userData.displayName}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {userData.email}
                      </p>
                      
                      <div className="flex items-center gap-2 justify-end">
                        <Badge variant="secondary" className="text-xs">
                          {userData.rating !== undefined ? userData.rating.toFixed(1) : "0.0"} ⭐
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button className="flex-1" variant="outline" asChild>
                      <Link href={`/user/${userData.uid}`}>
                        <UserIcon className="h-4 w-4 mr-2" />
                        פרופיל
                      </Link>
                    </Button>
                    {isConnected ? (
                      <Button className="flex-1 bg-green-500 hover:bg-green-600 text-white" disabled>
                        <UserIcon className="h-4 w-4 mr-2" />
                        מחובר
                      </Button>
                    ) : (
                      <Button className="flex-1" onClick={() => handleConnect(userData.uid)}>
                        <UserPlus className="h-4 w-4 mr-2" />
                        התחבר
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-md">
          <UsersIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">לא נמצאו משתמשים</h3>
          <p className="text-gray-500 dark:text-gray-400">
            נסה לשנות את מונחי החיפוש או חזור מאוחר יותר
          </p>
        </div>
      )}
    </div>
  );
}