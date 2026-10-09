import { createContext, useState } from "react";

export const UserDataContext = createContext(null);

const UserContext = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  return (
    <UserDataContext.Provider value={{ user, setUser, loading, setLoading, error, setError }}>
      {children}
    </UserDataContext.Provider>
  );
};

export default UserContext;
