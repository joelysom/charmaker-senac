import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Avatar } from './ui/avatar';
import { Badge } from './ui/badge';
import { 
  ArrowLeft, 
  MessageCircle, 
  Heart, 
  Share2, 
  Send,
  TrendingUp,
  Clock,
  Trash,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { motion } from 'motion/react';
import { UserData } from '../App';
import Avatar3D from './Avatar3D';
// @ts-ignore - Vite raw import
import frasesTxt from '../detoxlinguistico/frases.txt?raw';
// @ts-ignore - Vite raw import
import palavrasTxt from '../detoxlinguistico/palavras.txt?raw';
import styles from './ViolationModal.module.css';
import { auth, db } from '../firebase/firebase';
import { 
  doc, 
  getDoc, 
  setDoc,
  collection,
  query,
  orderBy,
  getDocs,
  deleteDoc,
  addDoc,
  updateDoc,
  increment,
  arrayUnion,
  arrayRemove,
  Timestamp
} from 'firebase/firestore';

type CommunityProps = {
  userData: UserData;
  onBack: () => void;
};

type Comment = {
  id: string;
  author: string;
  authorId: string;
  content: string;
  createdAt: any;
  character?: {
    gender: string;
    bodyType: string;
    skinColor: string;
    faceOption: string;
    hairId: number;
  };
  likes: number;
  likedBy: string[];
  replyTo?: string; // Name of user being replied to
  replyToId?: string; // ID of user being replied to
};

type Post = {
  id: string;
  author: string;
  authorId: string;
  avatar: string;
  time: string;
  content: string;
  likes: number;
  likedBy: string[];
  comments: Comment[];
  category: string;
  createdAt: any;
  character?: {
    gender: string;
    bodyType: string;
    skinColor: string;
    faceOption: string;
    hairId: number;
  };
};

const initialPosts: Post[] = [];

export function Community({ userData, onBack }: CommunityProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState('');
  const [activeTab, setActiveTab] = useState<'recent' | 'trending'>('recent');
  const [character, setCharacter] = useState<any>(null);
  const [loadingCharacter, setLoadingCharacter] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [expandedComments, setExpandedComments] = useState<string[]>([]);
  const [newComments, setNewComments] = useState<{ [key: string]: string }>({});
  const [blockedViolation, setBlockedViolation] = useState<null | { matched: string; fullText: string; type: 'post' | 'comment'; postId?: string }>(null);
  const [visiblePostsCount, setVisiblePostsCount] = useState(5);

  const [loadingComments, setLoadingComments] = useState<string[]>([]);
  const [shareMessage, setShareMessage] = useState<string>('');
  const [replyingTo, setReplyingTo] = useState<{ postId: string; commentId: string; author: string; authorId: string } | null>(null);
  const [showCommentsModal, setShowCommentsModal] = useState<{ postId: string; comments: Comment[] } | null>(null);

  const frasesList: string[] = (frasesTxt || '').split(/\r?\n/).map((s: string) => s.trim()).filter(Boolean) as string[];
  const palavrasList: string[] = (palavrasTxt || '').split(/\r?\n/).map((s: string) => s.trim()).filter(Boolean) as string[];
  const removeDiacritics = (str: string) => str.normalize?.('NFD').replace(/[\u0300-\u036f]/g, '') || str;
  const normalize = (str: string) => removeDiacritics(str).toLowerCase();
  const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&');
  
  const checkAndReport = async (text: string, type: 'post' | 'comment', postId?: string) => {
    if (!text || !text.trim()) return false;
    const normalizedText = normalize(text);
    for (const phrase of frasesList) {
      const normPhrase = normalize(phrase);
      if (!normPhrase) continue;
      if (normalizedText.includes(normPhrase)) {
        const matched = phrase;
        try {
          const user = auth.currentUser;
          await addDoc(collection(db, 'violations'), {
            userId: user?.uid || null,
            userName: userData?.name || null,
            matched,
            fullText: text,
            type,
            postId: postId || null,
            createdAt: Timestamp.now()
          });
        } catch (e) { console.error('Erro ao salvar violação:', e); }
        setBlockedViolation({ matched, fullText: text, type, postId });
        return true;
      }
    }
    for (const word of palavrasList) {
      const normWord = normalize(word);
      if (!normWord) continue;
      const re = new RegExp('\\b' + escapeRegExp(normWord) + '\\b', 'u');
      if (re.test(normalizedText)) {
        const matched = word;
        try {
          const user = auth.currentUser;
          await addDoc(collection(db, 'violations'), {
            userId: user?.uid || null,
            userName: userData?.name || null,
            matched,
            fullText: text,
            type,
            postId: postId || null,
            createdAt: Timestamp.now()
          });
        } catch (e) { console.error('Erro ao salvar violação:', e); }
        setBlockedViolation({ matched, fullText: text, type, postId });
        return true;
      }
    }
    return false;
  };

  const formatRelativeTime = (timestamp: any) => {
    if (!timestamp) return 'agora';
    const date = timestamp.toDate?.() || new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 1) return 'agora';
    if (diffMins < 60) return `há ${diffMins}m`;
    if (diffHours < 24) return `há ${diffHours}h`;
    if (diffDays < 7) return `há ${diffDays}d`;
    return date.toLocaleDateString('pt-BR');
  };

  useEffect(() => {
    const loadCharacter = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          setLoadingCharacter(false);
          return;
        }
        const charDoc = await getDoc(doc(db, 'characters', user.uid));
        if (charDoc.exists()) {
          setCharacter(charDoc.data());
        }
      } catch (e) {
        console.error('Erro ao carregar personagem:', e);
      } finally {
        setLoadingCharacter(false);
      }
    }
    loadCharacter();
  }, []);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        setLoadingPosts(true);
        const postsQuery = query(
          collection(db, 'posts'),
          orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(postsQuery);
        
        const loadedPosts: Post[] = await Promise.all(
          querySnapshot.docs.map(async (docSnapshot) => {
            const postData = docSnapshot.data();
            
            // Load comments count for each post
            const commentsQuery = query(collection(db, 'posts', docSnapshot.id, 'comments'));
            const commentsSnapshot = await getDocs(commentsQuery);
            const commentsCount = commentsSnapshot.size;
            
            return {
              id: docSnapshot.id,
              author: postData.author,
              authorId: postData.authorId,
              avatar: postData.avatar,
              content: postData.content,
              category: postData.category || 'Compartilhamento',
              likes: postData.likes || 0,
              likedBy: postData.likedBy || [],
              comments: new Array(commentsCount).fill(null).map(() => ({} as Comment)), // Placeholder comments to show count
              createdAt: postData.createdAt,
              time: formatRelativeTime(postData.createdAt),
              character: postData.character
            };
          })
        );

        setPosts(loadedPosts);
      } catch (e) {
        console.error('Erro ao carregar posts:', e);
      } finally {
        setLoadingPosts(false);
      }
    };

    loadPosts();
  }, []);

  const handleSubmitPost = async () => {
    if (!newPost.trim()) return;
    try {
      const blocked = await checkAndReport(newPost, 'post');
      if (blocked) return;
      const user = auth.currentUser;
      if (!user) return;
      const postId = `post_${Date.now()}`;
      const postData = {
        author: userData.name,
        authorId: user.uid,
        avatar: userData.avatar,
        content: newPost,
        category: 'Compartilhamento',
        likes: 0,
        likedBy: [],
        createdAt: Timestamp.now(),
        character: character
      };
      await setDoc(doc(db, 'posts', postId), postData);
      setPosts([
        {
          id: postId,
          ...postData,
          comments: [], // New posts start with 0 comments
          time: 'agora'
        },
        ...posts
      ]);
      setNewPost('');
    } catch (e) {
      console.error('Erro ao publicar post:', e);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      const user = auth.currentUser;
      if (!user) return;
      const postRef = doc(db, 'posts', postId);
      const postData = posts.find(p => p.id === postId);
      if (!postData) return;
      const isLiked = postData.likedBy.includes(user.uid);
      if (isLiked) {
        await updateDoc(postRef, {
          likes: increment(-1),
          likedBy: arrayRemove(user.uid)
        });
        setPosts(posts.map(p => 
          p.id === postId 
            ? { ...p, likes: p.likes - 1, likedBy: p.likedBy.filter(id => id !== user.uid) }
            : p
        ));
      } else {
        await updateDoc(postRef, {
          likes: increment(1),
          likedBy: arrayUnion(user.uid)
        });
        setPosts(posts.map(p => 
          p.id === postId 
            ? { ...p, likes: p.likes + 1, likedBy: [...p.likedBy, user.uid] }
            : p
        ));
      }
    } catch (e) {
      console.error('Erro ao fazer like:', e);
    }
  };

  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);
  const confirmDeletePost = (postId: string) => { setDeletingPostId(postId); };
  const cancelDelete = () => { setDeletingPostId(null); };
  const performDeletePost = async (postId: string) => {
    try {
      const user = auth.currentUser;
      if (!user) return;
      const post = posts.find(p => p.id === postId);
      if (!post || post.authorId !== user.uid) {
        setDeletingPostId(null);
        return;
      }
      const commentsSnap = await getDocs(collection(db, 'posts', postId, 'comments'));
      const deletePromises: Promise<any>[] = [];
      commentsSnap.forEach(cd => {
        deletePromises.push(deleteDoc(doc(db, 'posts', postId, 'comments', cd.id)));
      });
      await Promise.all(deletePromises);
      await deleteDoc(doc(db, 'posts', postId));
      setPosts(prev => prev.filter(p => p.id !== postId));
      setDeletingPostId(null);
    } catch (e) {
      console.error('Erro ao deletar post:', e);
      setDeletingPostId(null);
    }
  };

  const toggleComments = async (postId: string) => {
    if (expandedComments.includes(postId)) {
      setExpandedComments(prev => prev.filter(id => id !== postId));
      return;
    }

    setLoadingComments(prev => [...prev, postId]);
    try {
      const post = posts.find(p => p.id === postId);
      
      // Always load comments when expanding, even if we have placeholders
      if (post) {
        const commentsQuery = query(
          collection(db, 'posts', postId, 'comments'),
          orderBy('createdAt', 'desc')
        );
        const commentsSnapshot = await getDocs(commentsQuery);
        const comments: Comment[] = commentsSnapshot.docs.map(commentDoc => ({
          id: commentDoc.id,
          ...commentDoc.data(),
        })) as Comment[];

        setPosts(prevPosts => prevPosts.map(p => 
          p.id === postId ? { ...p, comments: comments } : p
        ));
      }
    } catch (e) {
      console.error("Erro ao carregar comentários:", e);
    } finally {
      setLoadingComments(prev => prev.filter(id => id !== postId));
    }

    setExpandedComments(prev => [...prev, postId]);
  };

  const handleSubmitComment = async (postId: string) => {
    const commentText = newComments[postId];
    if (!commentText?.trim()) return;
    try {
      const blocked = await checkAndReport(commentText, 'comment', postId);
      if (blocked) return;
      const user = auth.currentUser;
      if (!user) return;
      const commentId = `comment_${Date.now()}`;
      const commentData: any = {
        author: userData.name,
        authorId: user.uid,
        content: commentText,
        likes: 0,
        likedBy: [],
        createdAt: Timestamp.now(),
        character: character
      };

      // Add reply info if replying to someone
      let notificationRecipientId = null;
      if (replyingTo && replyingTo.postId === postId) {
        commentData.replyTo = replyingTo.author;
        commentData.replyToId = replyingTo.authorId;
        notificationRecipientId = replyingTo.authorId;
      } else {
        // If not replying, notify post author
        const post = posts.find(p => p.id === postId);
        if (post && post.authorId !== user.uid) {
          notificationRecipientId = post.authorId;
        }
      }

      await setDoc(
        doc(db, 'posts', postId, 'comments', commentId),
        commentData
      );

      // Create notification for the recipient
      if (notificationRecipientId && notificationRecipientId !== user.uid) {
        const notificationData = {
          type: replyingTo ? 'reply' : 'comment',
          recipientId: notificationRecipientId,
          senderId: user.uid,
          senderName: userData.name,
          senderAvatar: userData.avatar,
          senderCharacter: character,
          postId: postId,
          commentId: commentId,
          content: commentText.substring(0, 100),
          read: false,
          createdAt: Timestamp.now()
        };
        await addDoc(collection(db, 'notifications'), notificationData);
      }
      
      // Update the post with the new comment
      setPosts(posts.map(p => 
        p.id === postId
          ? {
              ...p,
              comments: [
                {
                  id: commentId,
                  ...commentData,
                  createdAt: commentData.createdAt
                },
                ...p.comments.filter(c => c.id) // Keep only real comments (filter out placeholders)
              ]
            }
          : p
      ));
      setNewComments(prev => ({ ...prev, [postId]: '' }));
      setReplyingTo(null); // Clear reply state
    } catch (e) {
      console.error('Erro ao comentar:', e);
    }
  };

  const handleLikeComment = async (postId: string, commentId: string) => {
    try {
      const user = auth.currentUser;
      if (!user) return;
      const post = posts.find(p => p.id === postId);
      const comment = post?.comments.find(c => c.id === commentId);
      if (!comment) return;
      const commentRef = doc(db, 'posts', postId, 'comments', commentId);
      const isLiked = comment.likedBy.includes(user.uid);
      if (isLiked) {
        await updateDoc(commentRef, {
          likes: increment(-1),
          likedBy: arrayRemove(user.uid)
        });
      } else {
        await updateDoc(commentRef, {
          likes: increment(1),
          likedBy: arrayUnion(user.uid)
        });
      }
      setPosts(posts.map(p =>
        p.id === postId
          ? {
              ...p,
              comments: p.comments.map(c =>
                c.id === commentId
                  ? {
                      ...c,
                      likes: isLiked ? c.likes - 1 : c.likes + 1,
                      likedBy: isLiked
                        ? c.likedBy.filter(id => id !== user.uid)
                        : [...c.likedBy, user.uid]
                    }
                  : c
              )
            }
          : p
      ));
    } catch (e) {
      console.error('Erro ao fazer like em comentário:', e);
    }
  };

  const handleShare = async (post: Post) => {
    const shareData = {
      title: `Post de ${post.author} - Raízes & Consciência`,
      text: `"${post.content}"\n\nPor: ${post.author}\nCategoria: ${post.category}\nPublicado ${post.time}`,
      url: window.location.href
    };

    // Tenta usar a Web Share API (funciona bem em mobile)
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        setShareMessage('Compartilhado com sucesso!');
        setTimeout(() => setShareMessage(''), 3000);
        return;
      } catch (error) {
        // Usuário cancelou ou erro, continua para fallback
        console.log('Web Share API falhou, usando fallback');
      }
    }

    // Fallback: copia para clipboard
    try {
      const shareText = `🌟 Raízes & Consciência\n\n"${post.content}"\n\n✍️ Por: ${post.author}\n🏷️ Categoria: ${post.category}\n🕒 ${post.time}\n\n💜 Compartilhado via Raízes & Consciência`;
      await navigator.clipboard.writeText(shareText);
      
      setShareMessage('Conteúdo copiado para compartilhar!');
      setTimeout(() => setShareMessage(''), 3000);
    } catch (error) {
      console.error('Erro ao copiar:', error);
      setShareMessage('Erro ao compartilhar. Tente novamente.');
      setTimeout(() => setShareMessage(''), 3000);
    }
  };

  return (
    <div className="py-8">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-purple-800">Comunidade</h1>
          <p className="text-gray-600">Compartilhe experiências e aprenda com outras pessoas</p>
        </div>
        
        {shareMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded-lg text-sm"
          >
            {shareMessage}
          </motion.div>
        )}
        
        {deletingPostId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
              className="absolute inset-0 bg-black/60 z-40"
              onClick={cancelDelete}
              style={{
                backdropFilter: 'blur(6px)',
                WebkitBackdropFilter: 'blur(6px)'
              }}
            />
            <Card className="z-50 p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirmar exclusão</h3>
              <p className="text-sm text-gray-600 mb-4">Deseja realmente deletar este post? Esta ação é irreversível e removerá também os comentários.</p>
              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={cancelDelete}>Cancelar</Button>
                <Button variant="destructive" onClick={() => performDeletePost(deletingPostId)}>Apagar</Button>
              </div>
            </Card>
          </div>
        )}
          
          {blockedViolation && (
            <div className={styles.overlay} onClick={() => setBlockedViolation(null)}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: "spring", duration: 0.5 }}
                className={styles.modalContainer}
                onClick={(e) => e.stopPropagation()}
              >
                <div className={styles.card}>
                  {/* Header com gradiente */}
                  <div className={styles.header}>
                    <button
                      onClick={() => setBlockedViolation(null)}
                      className={styles.closeButton}
                      aria-label="Fechar"
                    >
                      ✕
                    </button>
                    <div className={styles.headerContent}>
                      <div className={styles.iconCircle}>
                        <span>⚠️</span>
                      </div>
                      <div>
                        <h3 className={styles.title}>Conteúdo Bloqueado</h3>
                        <p className={styles.subtitle}>Violação das Diretrizes da Comunidade</p>
                      </div>
                    </div>
                  </div>

                  {/* Conteúdo */}
                  <div className={styles.content}>
                    <div className={styles.section}>
                      <p className={styles.sectionText}>
                        Sua {blockedViolation.type === 'post' ? 'publicação' : 'resposta'} foi bloqueada por conter conteúdo inadequado:
                      </p>
                      <div className={styles.matchedBox}>
                        <p className={styles.matchedText}>"{blockedViolation.matched}"</p>
                      </div>
                    </div>

                    <div className={styles.section}>
                      <p className={styles.sectionLabel}>Texto Original:</p>
                      <div className={styles.textBox}>
                        <p className={styles.textContent}>{blockedViolation.fullText}</p>
                      </div>
                    </div>

                    {/* Diretrizes */}
                    <div className={styles.guidelines}>
                      <p className={styles.guidelinesTitle}>💡 Lembre-se:</p>
                      <ul className={styles.guidelinesList}>
                        <li>Respeite todas as pessoas</li>
                        <li>Evite linguagem ofensiva ou discriminatória</li>
                        <li>Promova um ambiente acolhedor</li>
                      </ul>
                    </div>

                    {/* GIF de aviso com destaque */}
                    <div className={styles.gifContainer}>
                      <div className={styles.gifWrapper}>
                        <div className={styles.gifGlow}></div>
                        <div className={styles.gifBackground}>
                          <img 
                            src="/charmaker/aruanawarning.gif" 
                            alt="Aviso" 
                            className={styles.gifImage}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Botão */}
                    <div className={styles.buttonContainer}>
                      <button
                        onClick={() => setBlockedViolation(null)}
                        className={styles.confirmButton}
                      >
                        Entendi, vou revisar meu texto
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-2 space-y-6">
          
          <Card className="p-6">
            <div className="flex gap-4">
              {!loadingCharacter && character ? (
                <Avatar3D
                  gender={character.gender}
                  bodyType={character.bodyType}
                  skinColor={character.skinColor}
                  faceOption={character.faceOption}
                  hairId={character.hairId}
                  size={48}
                  bgGradient="linear-gradient(135deg, #9333ea 0%, #7c3aed 50%, #6d28d9 100%)"
                />
              ) : (
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">{userData.avatar}</span>
                </div>
              )}
              <div className="flex-grow">
                <Textarea
                  placeholder="Compartilhe suas reflexões, experiências ou perguntas..."
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  className="mb-3 min-h-[100px]"
                />
                <Button onClick={handleSubmitPost} disabled={!newPost.trim()}>
                  <Send className="w-4 h-4 mr-2" />
                  Publicar
                </Button>
              </div>
            </div>
          </Card>

          
          <div className="flex gap-2">
            <Button
              variant={activeTab === 'recent' ? 'default' : 'outline'}
              onClick={() => setActiveTab('recent')}
              className="flex-1"
            >
              <Clock className="w-4 h-4 mr-2" />
              Recentes
            </Button>
            <Button
              variant={activeTab === 'trending' ? 'default' : 'outline'}
              onClick={() => setActiveTab('trending')}
              className="flex-1"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Em Alta
            </Button>
          </div>

          
          <div className="space-y-4">
            {loadingPosts ? (
              <div className="flex flex-col items-center justify-center py-12">
                <img 
                  src="/charmaker/amandarunning.gif" 
                  alt="Carregando..." 
                  className="w-32 h-32 object-contain"
                />
                <p className="text-purple-600 font-semibold mt-4">Carregando posts...</p>
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-8 text-gray-600">Nenhum post ainda. Seja o primeiro a compartilhar!</div>
            ) : (
              <>
                {posts.slice(0, visiblePostsCount).map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                  <Card className="p-6 hover:shadow-lg transition-shadow">
                    
                    <div className="flex items-start gap-4 mb-4">
                      <div className="flex-grow">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-gray-800 font-semibold">{post.author}</p>
                          <Badge variant="secondary" className="text-xs">
                            {post.category}
                          </Badge>
                        </div>
                        <p className="text-gray-500 text-sm">{post.time}</p>
                      </div>
                      {post.authorId === auth.currentUser?.uid && (
                        <button
                          onClick={() => confirmDeletePost(post.id)}
                          className="text-gray-400 hover:text-gray-600 p-1"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"/>
                          </svg>
                        </button>
                      )}
                    </div>

                    <div className="flex items-start gap-4 mb-4">
                      {post.character ? (
                        <Avatar3D
                          gender={post.character.gender}
                          bodyType={post.character.bodyType}
                          skinColor={post.character.skinColor}
                          faceOption={post.character.faceOption}
                          hairId={post.character.hairId}
                          size={48}
                          bgGradient="linear-gradient(135deg, #9333ea 0%, #7c3aed 50%, #6d28d9 100%)"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-2xl">{post.avatar}</span>
                        </div>
                      )}
                      <div className="flex-grow">
                        <p className="text-gray-700">{post.content}</p>
                      </div>
                    </div>

                    
                    <div className="flex items-center gap-4 pt-4 border-t">
                      <button
                        onClick={() => handleLike(post.id)}
                        className={`p-2 transition-colors rounded-full hover:bg-gray-100 ${
                          post.likedBy.includes(auth.currentUser?.uid || '')
                            ? 'text-rose-600'
                            : 'text-gray-600 hover:text-rose-600'
                        }`}
                      >
                        <Heart className={`w-6 h-6 ${post.likedBy.includes(auth.currentUser?.uid || '') ? 'fill-current' : ''}`} />
                      </button>
                      <div className="relative">
                        <button
                          onClick={() => toggleComments(post.id)}
                          className="p-2 text-gray-600 hover:text-purple-600 transition-colors rounded-full hover:bg-gray-100"
                        >
                          <MessageCircle className="w-6 h-6" />
                        </button>
                        {post.comments.filter(c => c.id).length > 0 && (
                          <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                            {post.comments.filter(c => c.id).length}
                          </span>
                        )}
                      </div>
                      <button 
                        onClick={() => handleShare(post)}
                        className="p-2 text-gray-600 hover:text-blue-600 transition-colors rounded-full hover:bg-gray-100"
                      >
                        <Share2 className="w-6 h-6" />
                      </button>
                    </div>

                    
                    {expandedComments.includes(post.id) && (
                      <div className="mt-6 pt-6 border-t space-y-4">
                        
                        <div className="flex gap-4">
                          {character ? (
                            <Avatar3D
                              gender={character.gender}
                              bodyType={character.bodyType}
                              skinColor={character.skinColor}
                              faceOption={character.faceOption}
                              hairId={character.hairId}
                              size={40}
                              bgGradient="linear-gradient(135deg, #9333ea 0%, #7c3aed 50%, #6d28d9 100%)"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-violet-600 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-xl">{userData.avatar}</span>
                            </div>
                          )}
                          <div className="flex-grow">
                            {replyingTo && replyingTo.postId === post.id && (
                              <div className="flex items-center gap-2 mb-2 text-xs text-gray-600">
                                <span>Respondendo a <span className="font-semibold text-purple-600">@{replyingTo.author}</span></span>
                                <button
                                  onClick={() => setReplyingTo(null)}
                                  className="text-gray-400 hover:text-gray-600"
                                >
                                  ✕
                                </button>
                              </div>
                            )}
                            <div className="flex gap-2">
                              <input
                                type="text"
                                placeholder={replyingTo && replyingTo.postId === post.id ? `Respondendo @${replyingTo.author}...` : "Escreva um comentário..."}
                                value={newComments[post.id] || ''}
                                onChange={(e) =>
                                  setNewComments(prev => ({
                                    ...prev,
                                    [post.id]: e.target.value
                                  }))
                                }
                                className="flex-grow px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                              />
                              <Button
                                size="sm"
                                onClick={() => handleSubmitComment(post.id)}
                                disabled={!newComments[post.id]?.trim()}
                              >
                                <Send className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>

                        
                        {loadingComments.includes(post.id) ? (
                          
                          <div className="flex flex-col items-center justify-center py-8">
                            <img 
                              src="/charmaker/amandarunning.gif" 
                              alt="Carregando comentários..." 
                              className="w-24 h-24 object-contain"
                            />
                            <p className="text-purple-600 font-semibold text-sm mt-2">Carregando comentários...</p>
                          </div>
                        ) : post.comments.length > 0 && post.comments[0].id ? (
                          
                          <div className="space-y-4 mt-4">
                            {post.comments.slice(0, 3).map((comment) => (
                              <div key={comment.id} className="flex gap-3 pl-2 border-l-2 border-gray-200">
                                {comment.character ? (
                                        <Avatar3D
                                          gender={comment.character.gender}
                                          bodyType={comment.character.bodyType}
                                          skinColor={comment.character.skinColor}
                                          faceOption={comment.character.faceOption}
                                          hairId={comment.character.hairId}
                                          size={36}
                                          bgGradient="linear-gradient(135deg, #9333ea 0%, #7c3aed 50%, #6d28d9 100%)"
                                        />
                                      ) : (
                                        <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-violet-600 rounded-full flex items-center justify-center flex-shrink-0">
                                          <span className="text-lg">👤</span>
                                        </div>
                                      )}
                                <div className="flex-grow">
                                  <div className="flex items-center gap-2 mb-1">
                                    <p className="text-gray-800 text-sm font-semibold">{comment.author}</p>
                                    <p className="text-gray-500 text-xs">{formatRelativeTime(comment.createdAt)}</p>
                                  </div>
                                  <p className="text-gray-700 text-sm mb-2">
                                    {comment.replyTo && (
                                      <span className="text-purple-600 font-semibold mr-1">
                                        @{comment.replyTo}
                                      </span>
                                    )}
                                    {comment.content}
                                  </p>
                                  <div className="flex items-center gap-3">
                                    <button
                                      onClick={() => handleLikeComment(post.id, comment.id)}
                                      className={`flex items-center gap-1 text-xs transition-colors ${
                                        comment.likedBy.includes(auth.currentUser?.uid || '')
                                          ? 'text-rose-600'
                                          : 'text-gray-600 hover:text-rose-600'
                                      }`}
                                    >
                                      <Heart className={`w-3 h-3 ${comment.likedBy.includes(auth.currentUser?.uid || '') ? 'fill-current' : ''}`} />
                                      <span>{comment.likes > 0 ? comment.likes : ''}</span>
                                    </button>
                                    <button
                                      onClick={() => {
                                        setReplyingTo({
                                          postId: post.id,
                                          commentId: comment.id,
                                          author: comment.author,
                                          authorId: comment.authorId
                                        });
                                        // Focus on input
                                        const input = document.querySelector(`input[placeholder*="comentário"]`) as HTMLInputElement;
                                        input?.focus();
                                      }}
                                      className="text-xs text-gray-600 hover:text-purple-600 transition-colors font-semibold"
                                    >
                                      Responder
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                            {post.comments.length > 3 && (
                              <div className="flex justify-center mt-4">
                                <Button
                                  variant="outline"
                                  onClick={() => setShowCommentsModal({ postId: post.id, comments: post.comments })}
                                  className="text-purple-600 border-purple-600 hover:bg-purple-50"
                                >
                                  Ver Mais ({post.comments.length - 3} comentários)
                                </Button>
                              </div>
                            )}
                          </div>
                        ) : (
                          
                          <div className="text-center py-4 text-gray-500 text-sm">
                            Nenhum comentário ainda.
                          </div>
                        )}
                      </div>
                    )}
                  </Card>
                </motion.div>
                ))}
                
                {visiblePostsCount < posts.length && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-center pt-6"
                  >
                    <Button
                      variant="outline"
                      onClick={() => setVisiblePostsCount(prev => prev + 5)}
                      className="px-8 py-6 text-lg font-semibold border-2 border-purple-500 hover:bg-purple-50 hover:border-purple-600 transition-all"
                    >
                      <ChevronDown className="w-5 h-5 mr-2" />
                      Ver Mais Posts ({posts.length - visiblePostsCount} restantes)
                    </Button>
                  </motion.div>
                )}
              </>
            )}
          </div>
        </div>

        
        <div className="space-y-6">
          
          <Card className="p-6">
            <h3 className="text-purple-800 mb-4">Diretrizes da Comunidade</h3>
            <ul className="space-y-3 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-purple-600 mt-1">•</span>
                <span>Respeite todas as pessoas e suas experiências</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 mt-1">•</span>
                <span>Compartilhe conhecimento e aprenda com empatia</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 mt-1">•</span>
                <span>Denuncie comportamentos inadequados</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 mt-1">•</span>
                <span>Celebre a diversidade e a inclusão</span>
              </li>
            </ul>
          </Card>

          
          <Card className="p-6">
            <h3 className="text-purple-800 mb-4">Tópicos Populares</h3>
            <div className="flex flex-wrap gap-2">
              <Badge className="cursor-pointer hover:bg-purple-600">#Reflexão</Badge>
              <Badge className="cursor-pointer hover:bg-purple-600">#Cultura</Badge>
              <Badge className="cursor-pointer hover:bg-purple-600">#Literatura</Badge>
              <Badge className="cursor-pointer hover:bg-purple-600">#Música</Badge>
              <Badge className="cursor-pointer hover:bg-purple-600">#Cinema</Badge>
              <Badge className="cursor-pointer hover:bg-purple-600">#História</Badge>
              <Badge className="cursor-pointer hover:bg-purple-600">#Ativismo</Badge>
              <Badge className="cursor-pointer hover:bg-purple-600">#Educação</Badge>
            </div>
          </Card>

          
          <Card className="p-6 bg-gradient-to-br from-purple-50 to-blue-50">
            <h3 className="text-purple-800 mb-4">Nossa Comunidade</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Membros ativos</span>
                <span className="text-purple-800">1.247</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Posts esta semana</span>
                <span className="text-purple-800">342</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Conexões criadas</span>
                <span className="text-purple-800">5.891</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {showCommentsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 z-40"
            onClick={() => setShowCommentsModal(null)}
            style={{
              backdropFilter: 'blur(6px)',
              WebkitBackdropFilter: 'blur(6px)'
            }}
          />
          <Card className="z-50 p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-purple-800">Comentários</h3>
              <Button variant="ghost" onClick={() => setShowCommentsModal(null)}>
                ✕
              </Button>
            </div>
            <div className="space-y-4">
              {(() => {
                const post = posts.find(p => p.id === showCommentsModal.postId);
                return post ? post.comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3 pl-2 border-l-2 border-gray-200">
                    {comment.character ? (
                      <Avatar3D
                        gender={comment.character.gender}
                        bodyType={comment.character.bodyType}
                        skinColor={comment.character.skinColor}
                        faceOption={comment.character.faceOption}
                        hairId={comment.character.hairId}
                        size={36}
                        bgGradient="linear-gradient(135deg, #9333ea 0%, #7c3aed 50%, #6d28d9 100%)"
                      />
                    ) : (
                      <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-violet-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-lg">👤</span>
                      </div>
                    )}
                    <div className="flex-grow">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-gray-800 text-sm font-semibold">{comment.author}</p>
                        <p className="text-gray-500 text-xs">{formatRelativeTime(comment.createdAt)}</p>
                      </div>
                      <p className="text-gray-700 text-sm mb-2">
                        {comment.replyTo && (
                          <span className="text-purple-600 font-semibold mr-1">
                            @{comment.replyTo}
                          </span>
                        )}
                        {comment.content}
                      </p>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleLikeComment(showCommentsModal.postId, comment.id)}
                          className={`flex items-center gap-1 text-xs transition-colors ${
                            comment.likedBy.includes(auth.currentUser?.uid || '')
                              ? 'text-rose-600'
                              : 'text-gray-600 hover:text-rose-600'
                          }`}
                        >
                          <Heart className={`w-3 h-3 ${comment.likedBy.includes(auth.currentUser?.uid || '') ? 'fill-current' : ''}`} />
                          <span>{comment.likes > 0 ? comment.likes : ''}</span>
                        </button>
                        <button
                          onClick={() => {
                            setReplyingTo({
                              postId: showCommentsModal.postId,
                              commentId: comment.id,
                              author: comment.author,
                              authorId: comment.authorId
                            });
                            setShowCommentsModal(null); // Close modal to go back to post
                          }}
                          className="text-xs text-gray-600 hover:text-purple-600 transition-colors font-semibold"
                        >
                          Responder
                        </button>
                      </div>
                    </div>
                  </div>
                )) : null;
              })()}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
