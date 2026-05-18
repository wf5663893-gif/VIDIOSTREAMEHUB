import { useEffect, useMemo, useState } from "react";

const TOTAL_PAGES = 1000;
const PAGE_SIZE = 20;
const TOTAL_VIDEOS = TOTAL_PAGES * PAGE_SIZE;

const generateVideos = () => {
  const arr = [];
  const categories = ["Anime", "Action", "Fantasy", "Sci-Fi", "Drama"];

  for (let i = 1; i <= TOTAL_VIDEOS; i++) {
    arr.push({
      id: i,
      title: `Video ${i}`,
      category: categories[i % categories.length],
      image: `https://picsum.photos/seed/${i}/600/400`,
      video: "https://www.w3schools.com/html/mov_bbb.mp4",
    });
  }

  return arr;
};

const initialVideos = generateVideos();

export default function VideoStreamingWebsite() {
  const [videos] = useState(initialVideos);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loginData, setLoginData] = useState({ username: "", password: "" });
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [videoScale, setVideoScale] = useState(1);

  const [likes, setLikes] = useState({});
  const [comments, setComments] = useState({});
  const [commentInput, setCommentInput] = useState("");

  const [users, setUsers] = useState([
    { id: 1, name: "admin", role: "admin" },
    { id: 2, name: "user1", role: "user" },
    { id: 3, name: "user2", role: "user" },
  ]);

  const [adsConfig, setAdsConfig] = useState({
    enabled: true,
    cpm: 2.5,
    provider: "Google AdSense",
  });

  const pageSize = PAGE_SIZE;

  const filteredVideos = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return videos;
    return videos.filter(v => v.title.toLowerCase().includes(s) || v.category.toLowerCase().includes(s));
  }, [search, videos]);

  const totalPages = TOTAL_PAGES;

  const paginatedVideos = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredVideos.slice(start, start + pageSize);
  }, [filteredVideos, page, pageSize]);

  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [page, totalPages]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") setSelectedVideo(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    document.body.style.overflow = selectedVideo ? "hidden" : "auto";
  }, [selectedVideo]);

  const handleLogin = () => {
    if (!loginData.username || !loginData.password) return;
    setUser({ name: loginData.username });
    setIsAdmin(loginData.username === "admin");
  };

  const handleLogout = () => {
    setUser(null);
    setIsAdmin(false);
  };

  const toggleLike = (id) => {
    setLikes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const addComment = (id) => {
    if (!commentInput.trim()) return;
    setComments(prev => ({
      ...prev,
      [id]: [...(prev[id] || []), { user: user?.name || "guest", text: commentInput }]
    }));
    setCommentInput("");
  };

  const deleteUser = (id) => setUsers(u => u.filter(x => x.id !== id));

  const toggleAds = () => setAdsConfig(a => ({ ...a, enabled: !a.enabled }));

  const getPageNumbers = () => {
    const delta = 2;
    const range = [];
    const start = Math.max(2, page - delta);
    const end = Math.min(totalPages - 1, page + delta);

    range.push(1);
    if (start > 2) range.push("...");
    for (let i = start; i <= end; i++) range.push(i);
    if (end < totalPages - 1) range.push("...");
    if (totalPages > 1) range.push(totalPages);

    return range;
  };

  const closeModal = () => {
    setSelectedVideo(null);
    setVideoScale(1);
    setCommentInput("");
  };

  const zoomIn = () => setVideoScale(s => Math.min(s + 0.2, 2.5));
  const zoomOut = () => setVideoScale(s => Math.max(s - 0.2, 0.5));

  const pages = getPageNumbers();

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="sticky top-0 z-50 border-b border-zinc-800 bg-black/90 backdrop-blur">
        <div className="flex flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-red-600 font-bold">V</div>
            <h1 className="text-2xl font-bold">VideoStream</h1>
          </div>

          <input value={search} onChange={e => setSearch(e.target.value)} className="w-full md:w-72 px-4 py-2 bg-zinc-900 rounded-xl" placeholder="Search videos" />
        </div>
      </header>

      <section className="px-4 py-10">
        <h2 className="text-3xl font-bold mb-6">Videos</h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {paginatedVideos.map(v => (
            <div key={v.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
              <button onClick={() => setSelectedVideo(v)} className="text-left w-full">
                <img src={v.image} className="h-56 w-full object-cover" />
                <div className="p-4">
                  <div className="text-red-500 text-sm">{v.category}</div>
                  <div className="text-lg font-bold">{v.title}</div>
                </div>
              </button>

              <div className="px-4 pb-4 flex justify-between items-center">
                <button onClick={() => toggleLike(v.id)} className="px-3 py-1 bg-zinc-800 rounded">
                  {likes[v.id] ? "Unlike" : "Like"}
                </button>
                <span className="text-xs text-zinc-400">
                  {likes[v.id] ? 1 : 0} like
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-center gap-2">
          {pages.map((p, i) => (
            <button key={i} disabled={p === "..."} onClick={() => typeof p === "number" && setPage(p)} className="px-3 py-1 rounded bg-zinc-800">
              {p}
            </button>
          ))}
        </div>
      </section>

      {selectedVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
          <div className="w-full max-w-5xl bg-zinc-950 p-4 rounded-xl">
            <div className="flex justify-end gap-2 mb-2">
              <button onClick={zoomOut} className="px-3 py-1 bg-zinc-800 rounded">-</button>
              <button onClick={zoomIn} className="px-3 py-1 bg-zinc-800 rounded">+</button>
              <button onClick={closeModal} className="px-3 py-1 bg-red-600 rounded">Close</button>
            </div>

            <video src={selectedVideo.video} controls autoPlay style={{ transform: `scale(${videoScale})` }} className="w-full h-[500px] object-contain" />

            <div className="mt-4">
              <div className="flex gap-2">
                <input value={commentInput} onChange={e => setCommentInput(e.target.value)} className="flex-1 px-3 py-2 bg-zinc-900 rounded" placeholder="Write comment..." />
                <button onClick={() => addComment(selectedVideo.id)} className="px-3 py-2 bg-red-600 rounded">Send</button>
              </div>

              <div className="mt-3 space-y-2 max-h-40 overflow-y-auto">
                {(comments[selectedVideo.id] || []).map((c, i) => (
                  <div key={i} className="text-sm bg-zinc-900 p-2 rounded">
                    <b>{c.user}:</b> {c.text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
