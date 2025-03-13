import { useParams } from "react-router-dom";
import BlogFeed from "./Blog.js";
import returnIcon from "../TaT/StaffDashboard/ImageDashboard/return-button.png";
import { Link } from "react-router-dom";

const BlogDetail = () => {
  const { id } = useParams(); // Lấy ID từ URL

  return (
    <div>
      <Link to={`/blog`}>
        <img
          src={returnIcon}
          alt="Quay Lại"
          className="return-button"
          style={{ cursor: "pointer" }} // Hiển thị con trỏ khi hover
        />
      </Link>

      <BlogFeed blogId={id} />
    </div>
  );
};

export default BlogDetail;
