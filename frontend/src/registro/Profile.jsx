import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Profile() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (!savedUser) {
      navigate("/login");
    } else {
      setUser(JSON.parse(savedUser));
    }
  }, [navigate]);

  if (!user) return null;

  return (
    <div className="profile-container">
      <h2>Мій кабінет</h2>
      <p><b>Ім’я:</b> {user.name}</p>
      <p><b>Email:</b> {user.email}</p>
    </div>
  );
}

export default Profile;
