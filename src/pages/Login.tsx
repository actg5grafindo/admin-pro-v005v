import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import { formatDate, formatTime } from "@/utils/dateUtils";

const Login = ({ role }: { role: "admin" | "submitter" }) => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [language, setLanguage] = useState<'en' | 'id'>('en');
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  
  const [loginData, setLoginData] = useState({
    identifier: "",
    password: "",
  });
  const [registerData, setRegisterData] = useState({
    name: "",
    username: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const translations = {
    en: {
      title: role === "admin" ? "Admin Login" : "Item Code Portal",
      description: role === "admin" 
        ? "Enter your credentials to manage item codes"
        : "Login or create an account to submit item codes",
      login: "Login",
      register: "Register",
      createAccount: "Create Account",
      fullName: "Full Name",
      username: "Username",
      email: "Email",
      phoneNumber: "Phone Number",
      password: "Password",
      confirmPassword: "Confirm Password",
      loginIdentifier: "Username, Email, or Phone Number",
    },
    id: {
      title: role === "admin" ? "Login Admin" : "Portal Kode Barang",
      description: role === "admin"
        ? "Masukkan kredensial Anda untuk mengelola kode barang"
        : "Login atau buat akun untuk mengajukan kode barang",
      login: "Masuk",
      register: "Daftar",
      createAccount: "Buat Akun",
      fullName: "Nama Lengkap",
      username: "Nama Pengguna",
      email: "Email",
      phoneNumber: "Nomor Telepon",
      password: "Kata Sandi",
      confirmPassword: "Konfirmasi Kata Sandi",
      loginIdentifier: "Nama Pengguna, Email, atau Nomor Telepon",
    }
  };

  const t = translations[language];

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // This is a mock login - in real app we'd integrate with auth system
    if (loginData.identifier && loginData.password) {
      localStorage.setItem("userRole", role);
      toast.success("Login successful!");
      navigate(role === "admin" ? "/admin" : "/submit");
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (registerData.password !== registerData.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }
    // This is a mock registration - in real app we'd integrate with auth system
    if (registerData.email && registerData.password && registerData.name) {
      localStorage.setItem("userRole", "submitter");
      toast.success("Registration successful! You can now login.");
      setLoginData({ identifier: registerData.email, password: "" });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-50 px-4 relative">
      <div className="absolute top-4 right-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setLanguage(language === 'en' ? 'id' : 'en')}
          className="text-sm font-medium"
        >
          {language.toUpperCase()} | {language === 'en' ? 'ID' : 'EN'}
        </Button>
      </div>
      
      <div className="text-center my-8">
        <p className="text-lg font-medium text-gray-600">
          {formatDate(currentDateTime, language)}
        </p>
        <p className="text-3xl font-bold text-gray-800">
          {formatTime(currentDateTime)}
        </p>
      </div>

      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold tracking-tight">
            {t.title}
          </CardTitle>
          <CardDescription>
            {t.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {role === "admin" ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="text"
                  placeholder={t.email}
                  value={loginData.identifier}
                  onChange={(e) => setLoginData({ ...loginData, identifier: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2 relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder={t.password}
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <Button type="submit" className="w-full">
                {t.login}
              </Button>
            </form>
          ) : (
            <Tabs defaultValue="login" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">{t.login}</TabsTrigger>
                <TabsTrigger value="register">{t.register}</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Input
                      type="text"
                      placeholder={t.loginIdentifier}
                      value={loginData.identifier}
                      onChange={(e) => setLoginData({ ...loginData, identifier: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2 relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder={t.password}
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <Button type="submit" className="w-full">
                    {t.login}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Input
                      type="text"
                      placeholder={t.fullName}
                      value={registerData.name}
                      onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Input
                      type="text"
                      placeholder={t.username}
                      value={registerData.username}
                      onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Input
                      type="email"
                      placeholder={t.email}
                      value={registerData.email}
                      onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Input
                      type="tel"
                      placeholder={t.phoneNumber}
                      value={registerData.phoneNumber}
                      onChange={(e) => setRegisterData({ ...registerData, phoneNumber: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2 relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder={t.password}
                      value={registerData.password}
                      onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <div className="space-y-2 relative">
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder={t.confirmPassword}
                      value={registerData.confirmPassword}
                      onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <Button type="submit" className="w-full">
                    {t.createAccount}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;