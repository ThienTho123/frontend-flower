import { useEffect } from "react";

const useBootstrap = () => {
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://cdn.jsdelivr.net/npm/bootstrap/dist/css/bootstrap.min.css";
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link); // Gỡ bỏ khi component unmount
    };
  }, []);
};

export default useBootstrap;
