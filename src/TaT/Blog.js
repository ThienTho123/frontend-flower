import React, { useState, useEffect } from "react";
import LazyLoad from "react-lazy-load";
import { Card, Modal } from "react-bootstrap";
import "./Blog.css";
import axios from "axios";
import { FaThumbsUp, FaComment, FaThumbtack, FaReply } from "react-icons/fa";
import useBootstrap from "./useBootstrap";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import CommentItem from "./CommentBlog";
import BlogFlowerCarousel from "./FlowerCarousel";
import { Link } from "react-router-dom";
const BlogFeed = ({ blogId }) => {
  useBootstrap();
  const [blogs, setBlogs] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentImages, setCurrentImages] = useState([]);
  const accesstoken = localStorage.getItem("access_token");
  const [openDialog, setOpenDialog] = useState(false);
  const [openComments, setOpenComments] = useState(null);
  const [visibleComments, setVisibleComments] = useState({});
  const [commentText, setCommentText] = useState("");
  const [commentImages, setCommentImages] = useState([]); // Lưu danh sách File
  const [commentImageUrls, setCommentImageUrls] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [triggerReload, setTriggerReload] = useState(false);
  const [commentID, setCommentID] = useState();
  useEffect(() => {
    setCommentText("");
    setCommentImageUrls([]);
    setCommentImages([]);
  }, [openComments]);

  useEffect(
    () => {
      const headers = accesstoken
        ? { Authorization: `Bearer ${accesstoken}` }
        : {};
      const apiUrl = blogId
        ? `https://deploybackend-1ta9.onrender.com/blog/${blogId}`
        : "https://deploybackend-1ta9.onrender.com/blog";

      fetch(apiUrl, { headers })
        .then((response) => response.json())
        .then((data) => {
          if (blogId) {
            setBlogs(data.BlogInfo);
          } else {
            setBlogs(data.BlogInfo);
          }
          const initialComments = {};
          data.BlogInfo.forEach((blog) => {
            initialComments[blog.blog.blogid] = 1;
          });
          setVisibleComments(initialComments);
        })
        .catch((error) => console.error("Lỗi khi lấy dữ liệu blog:", error));
    },
    [triggerReload],
    [commentID]
  ); // useEffect sẽ chạy lại khi triggerReload thay đổi

  const handleLikeClick = async (blog) => {
    const accesstoken = localStorage.getItem("access_token");
    if (!accesstoken) {
      setOpenDialog(true); // Mở hộp thoại thay vì alert
      return;
    }

    const requestBody = {
      blogid: blog.blog.blogid,
      commentid: null,
      comment: "",
      imageurl: [],
    };

    try {
      const response = await fetch(
        "https://deploybackend-1ta9.onrender.com/blog/like",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accesstoken}`,
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (response.ok) {
        setBlogs((prevBlogs) =>
          prevBlogs.map((b) =>
            b.blog.blogid === blog.blog.blogid
              ? {
                  ...b,
                  likeBlog: !b.likeBlog,
                  blog: {
                    ...b.blog,
                    like: b.blog.like + (b.likeBlog ? -1 : 1),
                  },
                }
              : b
          )
        );
      } else {
        console.error("Lỗi khi gửi yêu cầu like:", response.statusText);
      }
    } catch (error) {
      console.error("Lỗi kết nối server:", error);
    }
  };

  const handlePinClick = async (blog) => {
    const accesstoken = localStorage.getItem("access_token");
    if (!accesstoken) {
      setOpenDialog(true); // Mở hộp thoại thay vì alert
      return;
    }

    const requestBody = {
      blogid: blog.blog.blogid,
      commentid: null,
      comment: "",
      imageurl: [],
    };

    try {
      const response = await fetch(
        "https://deploybackend-1ta9.onrender.com/blog/pin",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accesstoken}`,
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (response.ok) {
        setBlogs((prevBlogs) =>
          prevBlogs.map((b) =>
            b.blog.blogid === blog.blog.blogid
              ? {
                  ...b,
                  pinBlog: !b.pinBlog,
                }
              : b
          )
        );
      } else {
        console.error("Lỗi khi gửi yêu cầu like:", response.statusText);
      }
    } catch (error) {
      console.error("Lỗi kết nối server:", error);
    }
  };

  const handleCommentClick = (blogId) => {
    setOpenComments(openComments === blogId ? null : blogId);
    setTriggerReload((prev) => !prev);
  };

  const formatTimeAgo = (dateArray) => {
    if (!Array.isArray(dateArray) || dateArray.length < 6)
      return "Ngày không hợp lệ";

    const postDate = new Date(
      dateArray[0],
      dateArray[1] - 1,
      dateArray[2],
      dateArray[3],
      dateArray[4],
      dateArray[5]
    );

    if (isNaN(postDate.getTime())) return "Ngày không hợp lệ";

    const now = new Date();
    const diffInSeconds = Math.floor((now - postDate) / 1000);

    if (diffInSeconds < 60) return "1 phút trước";
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} giờ trước`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) return `${diffInDays} ngày trước`;

    return postDate.toLocaleDateString("vi-VN");
  };

  // Mở modal và đặt danh sách ảnh
  const openImageModal = (images, index) => {
    setCurrentImages(images);
    setCurrentImageIndex(index);
    setSelectedImage(images[index].image);
  };

  // Đóng modal
  const closeImageModal = () => {
    setSelectedImage(null);
  };

  // Chuyển tới ảnh tiếp theo
  const nextImage = () => {
    const newIndex = (currentImageIndex + 1) % currentImages.length;
    setCurrentImageIndex(newIndex);
    setSelectedImage(currentImages[newIndex].image);
  };

  // Quay lại ảnh trước đó
  const prevImage = () => {
    const newIndex =
      (currentImageIndex - 1 + currentImages.length) % currentImages.length;
    setCurrentImageIndex(newIndex);
    setSelectedImage(currentImages[newIndex].image);
  };

  const loadMoreComments = (blogId) => {
    setVisibleComments((prev) => ({
      ...prev,
      [blogId]: (prev[blogId] || 1) + 3,
    }));
  };

  const handleImageChange = (event) => {
    const files = Array.from(event.target.files); // Chuyển FileList thành mảng
    setCommentImages(files); // Lưu danh sách file

    // Tạo URL để hiển thị ảnh trước khi tải lên
    const urls = files.map((file) => URL.createObjectURL(file));
    setCommentImageUrls(urls);
  };

  const handleSubmitComment = async (blogId, commentid) => {
    const accesstoken = localStorage.getItem("access_token");
    if (!accesstoken) {
      setOpenDialog(true); // Mở hộp thoại thay vì alert
      return;
    }

    setUploading(true);

    let uploadedImageUrls = [];

    // Nếu có ảnh, upload từng ảnh lên server trước
    if (commentImages.length > 0) {
      const uploadPromises = commentImages.map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);

        try {
          const uploadResponse = await fetch(
            "https://deploybackend-1ta9.onrender.com/api/v1/upload",
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${accesstoken}`,
              },
              credentials: "include",
              body: formData,
            }
          );
          if (!uploadResponse.ok)
            throw new Error("Kích thước ảnh không phù hợp");

          const result = await uploadResponse.json();
          return result.DT; // Lấy URL từ API
        } catch (error) {
          console.error("Lỗi tải ảnh:", error);
          return null;
        }
      });

      // Chờ tất cả ảnh tải lên thành công
      uploadedImageUrls = await Promise.all(uploadPromises);
      const failedUploads = uploadedImageUrls.filter((url) => url === null);
      if (failedUploads.length > 0) {
        alert("Kích thước ảnh không phù hợp để đăng! Vui lòng chọn ảnh khác.");
        setUploading(false);
        return;
      }
    }

    uploadedImageUrls = uploadedImageUrls.filter((url) => url !== null);
    if (!commentText.trim() && uploadedImageUrls.length === 0) {
      setUploading(false);
      return;
    }

    // Xử lý logic blogId và commentId
    const requestData = {
      blogid: commentid ? null : blogId, // Nếu có commentid thì bỏ blogid
      commentid: commentid || null, // Giữ nguyên commentid
      comment: commentText,
      imageurl: uploadedImageUrls, // Gửi danh sách URL ảnh
    };

    try {
      await axios.post(
        "https://deploybackend-1ta9.onrender.com/blog/comment",
        requestData,
        {
          headers: {
            Authorization: `Bearer ${accesstoken}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Reset sau khi gửi thành công
      setCommentText("");
      setCommentImages([]);
      setCommentImageUrls([]);
      setCommentID(null); // Reset commentID sau khi gửi

      setTriggerReload((prev) => !prev);
    } catch (error) {
      console.error("Lỗi gửi bình luận:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleCommentAction = (commentId, accountName) => {
    setCommentID(commentId);
    setCommentText(`@${accountName} `);
    console.log("commentID: ", commentId);
  };

  const handlePaste = (e) => {
    const items = e.clipboardData.items;
    const files = [];

    for (let i = 0; i < items.length; i++) {
      if (items[i].kind === "file") {
        const file = items[i].getAsFile();
        files.push(file);
      }
    }

    if (files.length > 0) {
      handleFiles(files);
    }
  };

  const handleFiles = (files) => {
    const newImageUrls = files.map((file) => URL.createObjectURL(file));
    setCommentImages((prev) => [...prev, ...files]);
    setCommentImageUrls((prev) => [...prev, ...newImageUrls]);
  };

  const handleRemoveImage = (index) => {
    setCommentImages((prev) => prev.filter((_, i) => i !== index));
    setCommentImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCommentChange = (e) => {
    const value = e.target.value;
    setCommentText(value);

    if (!value.startsWith("@")) {
      setCommentID(null);
    }

    console.log("commentID: ", commentID);
  };

  return (
    <div className="container mt-4 ">
      {blogs.map((blog) => (
        <Card key={blog.blog.blogid} className="mb-4 shadow-sm">
          <Card.Body>
            <Card.Header className="card-header">
              <img src={blog.blog.account.avatar} alt="Avatar" />
              <div className="card-header-content">
                <Link
                  to={`/blog/${blog.blog.blogid}`}
                  style={{
                    textDecoration: "none",
                    color: "inherit",
                    fontWeight: "600",
                  }}
                >
                  <span>{blog.blog.account.name}</span>
                </Link>{" "}
                <span className="date">{formatTimeAgo(blog.blog.date)}</span>
              </div>
            </Card.Header>
            <Card.Text>{blog.blog.content}</Card.Text>
            <div
              className={`blog-images ${
                blog.blogImages.length === 1
                  ? "one-image"
                  : blog.blogImages.length === 2
                  ? "two-images"
                  : blog.blogImages.length === 3
                  ? "three-images"
                  : blog.blogImages.length === 4
                  ? "four-images"
                  : "more-than-four"
              }`}
            >
              {blog.blogImages.slice(0, 4).map((image, index) => (
                <LazyLoad key={image.imageblogid} height={400} offset={100}>
                  <img
                    src={image.image}
                    alt="Blog"
                    className="img-fluid rounded mb-2"
                    onClick={() => openImageModal(blog.blogImages, index)}
                  />
                </LazyLoad>
              ))}

              {/* Nếu có nhiều hơn 4 ảnh, hiển thị overlay */}
              {blog.blogImages.length > 4 && (
                <div
                  className="extra-overlay"
                  onClick={() => openImageModal(blog.blogImages, 3)}
                >
                  +{blog.blogImages.length - 4} ảnh
                </div>
              )}
            </div>

            <div className="blog-flower-container">
              <span className="similar-products-title">
                Các sản phẩm tương tự
              </span>
              {blog.blogFlower && blog.blogFlower.length > 0 ? (
                <BlogFlowerCarousel blogFlowers={blog.blogFlower} />
              ) : (
                <p>Không có sản phẩm nào</p>
              )}
            </div>
            <div className="like-container">
              <div className="like-state">
                <img
                  className="like-button"
                  src="data:image/svg+xml,%3Csvg fill='none' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath d='M16.0001 7.9996c0 4.418-3.5815 7.9996-7.9995 7.9996S.001 12.4176.001 7.9996 3.5825 0 8.0006 0C12.4186 0 16 3.5815 16 7.9996Z' fill='url(%23paint0_linear_15251_63610)'/%3E%3Cpath d='M16.0001 7.9996c0 4.418-3.5815 7.9996-7.9995 7.9996S.001 12.4176.001 7.9996 3.5825 0 8.0006 0C12.4186 0 16 3.5815 16 7.9996Z' fill='url(%23paint1_radial_15251_63610)'/%3E%3Cpath d='M16.0001 7.9996c0 4.418-3.5815 7.9996-7.9995 7.9996S.001 12.4176.001 7.9996 3.5825 0 8.0006 0C12.4186 0 16 3.5815 16 7.9996Z' fill='url(%23paint2_radial_15251_63610)' fill-opacity='.5'/%3E%3Cpath d='M7.3014 3.8662a.6974.6974 0 0 1 .6974-.6977c.6742 0 1.2207.5465 1.2207 1.2206v1.7464a.101.101 0 0 0 .101.101h1.7953c.992 0 1.7232.9273 1.4917 1.892l-.4572 1.9047a2.301 2.301 0 0 1-2.2374 1.764H6.9185a.5752.5752 0 0 1-.5752-.5752V7.7384c0-.4168.097-.8278.2834-1.2005l.2856-.5712a3.6878 3.6878 0 0 0 .3893-1.6509l-.0002-.4496ZM4.367 7a.767.767 0 0 0-.7669.767v3.2598a.767.767 0 0 0 .767.767h.767a.3835.3835 0 0 0 .3835-.3835V7.3835A.3835.3835 0 0 0 5.134 7h-.767Z' fill='%23fff'/%3E%3Cdefs%3E%3CradialGradient id='paint1_radial_15251_63610' cx='0' cy='0' r='1' gradientUnits='userSpaceOnUse' gradientTransform='rotate(90 .0005 8) scale(7.99958)'%3E%3Cstop offset='.5618' stop-color='%230866FF' stop-opacity='0'/%3E%3Cstop offset='1' stop-color='%230866FF' stop-opacity='.1'/%3E%3C/radialGradient%3E%3CradialGradient id='paint2_radial_15251_63610' cx='0' cy='0' r='1' gradientUnits='userSpaceOnUse' gradientTransform='rotate(45 -4.5257 10.9237) scale(10.1818)'%3E%3Cstop offset='.3143' stop-color='%2302ADFC'/%3E%3Cstop offset='1' stop-color='%2302ADFC' stop-opacity='0'/%3E%3C/radialGradient%3E%3ClinearGradient id='paint0_linear_15251_63610' x1='2.3989' y1='2.3999' x2='13.5983' y2='13.5993' gradientUnits='userSpaceOnUse'%3E%3Cstop stop-color='%2302ADFC'/%3E%3Cstop offset='.5' stop-color='%230866FF'/%3E%3Cstop offset='1' stop-color='%232B7EFF'/%3E%3C/linearGradient%3E%3C/defs%3E%3C/svg%3E"
                />
                <span className="like-count">{blog.blog.like}</span>
              </div>
              <div className="comment-state">
                <button
                  style={{ all: "unset", cursor: "pointer" }}
                  onClick={() => handleCommentClick(blog.blog.blogid)}
                >
                  <span className="comment-count">
                    {blog.numberComments} bình luận
                  </span>
                </button>
              </div>
            </div>
            <div className="button-group">
              <button
                className={`${blog.likeBlog ? "liked" : ""}`}
                onClick={() => handleLikeClick(blog)}
              >
                <FaThumbsUp />
                {blog.likeBlog ? "Đã Thích" : "Thích"}
              </button>

              <button onClick={() => handleCommentClick(blog.blog.blogid)}>
                <FaComment /> Bình luận
              </button>

              <button
                className={`${blog.pinBlog ? "liked" : ""}`}
                onClick={() => handlePinClick(blog)}
              >
                <FaThumbtack /> {blog.pinBlog ? "Đã Ghim" : "Ghim"}
              </button>
            </div>
            {openComments === blog.blog.blogid && (
              <div className="comments-section">
                {/* Danh sách bình luận */}
                {blog.blogCommentDTOS
                  .slice(0, visibleComments[blog.blog.blogid] || 1)
                  .map((comment) => (
                    <CommentItem
                      key={comment.blogComment.blogcommentid}
                      comment={comment}
                      onAction={handleCommentAction}
                    />
                  ))}
                {visibleComments[blog.blog.blogid] <
                  blog.blogCommentDTOS.length && (
                  <Button
                    onClick={() => loadMoreComments(blog.blog.blogid, null)}
                  >
                    Tải thêm
                  </Button>
                )}

                {/* Vùng nhập bình luận */}
                <div className="comment-input">
                  <div className="input-container">
                    <input
                      type="text"
                      placeholder="Viết bình luận..."
                      value={commentText}
                      onChange={handleCommentChange}
                      onPaste={handlePaste}
                    />
                    <label className="upload-btn" htmlFor="file-upload">
                      Chọn ảnh
                    </label>
                    <input
                      id="file-upload"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageChange}
                    />

                    {/* Hiển thị danh sách ảnh đã chọn */}
                    <div
                      className="image-preview"
                      style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}
                    >
                      {commentImageUrls.map((url, index) => (
                        <div
                          key={index}
                          style={{
                            position: "relative",
                            display: "inline-block",
                          }}
                        >
                          <img
                            src={url}
                            alt={`preview-${index}`}
                            width="100"
                            style={{ borderRadius: "5px" }}
                          />
                          {/* Nút X để xóa ảnh */}
                          <button
                            onClick={() => handleRemoveImage(index)}
                            style={{
                              position: "absolute",
                              top: "-5px",
                              right: "-5px",
                              background: "red",
                              color: "white",
                              border: "none",
                              borderRadius: "50%",
                              width: "20px",
                              height: "20px",
                              cursor: "pointer",
                              fontSize: "12px",
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>

                    <button
                      className="Send-button"
                      onClick={() =>
                        handleSubmitComment(blog.blog.blogid, commentID)
                      }
                      disabled={uploading}
                    >
                      {uploading ? "Đang gửi..." : "Gửi"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </Card.Body>
        </Card>
      ))}

      {/* Modal phóng to ảnh */}
      <Modal show={selectedImage !== null} onHide={closeImageModal} centered>
        <Modal.Body className="text-center">
          <button className="modal-close-btn" onClick={closeImageModal}>
            ✖
          </button>
          <button className="modal-prev-btn" onClick={prevImage}>
            ◀
          </button>
          <img
            src={selectedImage}
            alt="Phóng to"
            className="img-fluid modal-image"
          />
          <button className="modal-next-btn" onClick={nextImage}>
            ▶
          </button>
        </Modal.Body>
      </Modal>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Thông báo</DialogTitle>
        <DialogContent>
          Bạn cần đăng nhập để tương tác với bài viết.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="primary">
            Đóng
          </Button>
          <Button
            onClick={() => (window.location.href = "/login")}
            color="primary"
          >
            Đăng nhập
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default BlogFeed;
