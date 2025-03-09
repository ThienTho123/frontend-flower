import { useParams } from "react-router-dom";
import BlogFeed from "./Blog.js";

const BlogDetail = () => {
  const { id } = useParams(); // Lấy ID từ URL

  return <BlogFeed blogId={id} />;
};

export default BlogDetail;
