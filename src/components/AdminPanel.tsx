import { useState, FormEvent, useEffect } from "react";
import { useQuery, keepPreviousData, useQueryClient } from "@tanstack/react-query";
import { GameAccount, Transaction } from "../data";
import { api, uploadImage, isUploadableImage } from "../api";

interface PagedResult<T> {
  data: T[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
}

interface AdminUser {
  id: string;
  email: string;
  name: string;
  phoneNumber?: string | null;
  balance: number;
  role: string;
}

// Giao dịch cộng tiền vào ví (hiển thị dấu +, màu xanh): nạp thẻ/ATM/ngân hàng hoặc admin tặng tiền.
const isCreditTx = (type: string) =>
  type === "card" || type === "atm" ||
  type === "recharge_card" || type === "recharge_atm" || type === "recharge_bank" ||
  type === "admin_gift";
import {
  Shield,
  Plus,
  Trash2,
  Coins,
  History,
  Inbox,
  X,
  Search,
  Eye,
  Info,
  LayoutDashboard,
  BarChart3,
  PieChart,
  TrendingUp,
  Settings,
  Home,
  Gift,
  Wallet,
} from "lucide-react";
import EmptyState from "./EmptyState";
import ConfirmDialog from "./ConfirmDialog";
import { useToastStore } from "../store/useToastStore";

interface AdminPanelProps {
  accounts: GameAccount[];
  transactions: Transaction[];
  dashboardStats?: {
    totalAccounts: number;
    availableAccounts: number;
    totalRevenue: number;
    totalRecharged: number;
    monthlyRevenue: Array<{ month: string; revenue: number }>;
    rechargeMethods: Array<{ method: string; amount: number }>;
  };
  onAddAccount: (newAcc: GameAccount) => void;
  onDeleteAccount: (id: string) => void;
  onResetShop: () => void;
  onBack: () => void;
  onEditAccount?: (updatedAcc: GameAccount) => void;
  // New props for editing web content
  tickerNews: string;
  onUpdateTickerNews: (text: string) => void;
  atmBank: string;
  atmAccountNumber: string;
  atmAccountOwner: string;
  momoPhone: string;
  momoAccountOwner: string;
  onUpdateBilling: (billing: {
    atmBank: string;
    atmAccountNumber: string;
    atmAccountOwner: string;
    momoPhone: string;
    momoAccountOwner: string;
  }) => void;
  categories: string[];
  onAddCategory: (cat: string) => void;
  onEditCategory: (oldCat: string, newCat: string) => void;
  onDeleteCategory: (cat: string) => void;
  footerPhone: string;
  footerZalo: string;
  footerFacebook: string;
  footerBrandName: string;
  footerAboutText: string;
  footerHours: string;
  footerPolicy: string;
  footerCopyright: string;
  onUpdateFooterLinks: (links: {
    tickerNews?: string;
    phone: string;
    zalo: string;
    facebook: string;
    brandName?: string;
    aboutText?: string;
    hours?: string;
    policy?: string;
    copyright?: string;
  }) => void;
}

export default function AdminPanel({
  accounts,
  transactions,
  dashboardStats,
  onAddAccount,
  onDeleteAccount,
  onResetShop,
  onBack,
  onEditAccount,
  tickerNews,
  onUpdateTickerNews,
  atmBank,
  atmAccountNumber,
  atmAccountOwner,
  momoPhone,
  momoAccountOwner,
  onUpdateBilling,
  categories,
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
  footerPhone,
  footerZalo,
  footerFacebook,
  footerBrandName,
  footerAboutText,
  footerHours,
  footerPolicy,
  footerCopyright,
  onUpdateFooterLinks,
}: AdminPanelProps) {
  // Navigation & tabs states
  const { addToast } = useToastStore();
  const [activeTab, setActiveTab] = useState<"dashboard" | "transactions" | "accounts" | "content" | "categories">("dashboard");
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [selectedAcc, setSelectedAcc] = useState<GameAccount | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAcc, setEditingAcc] = useState<GameAccount | null>(null);

  // Confirmations
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Tặng tiền cho user
  const queryClient = useQueryClient();
  const [giftModalOpen, setGiftModalOpen] = useState(false);
  const [giftUserSearch, setGiftUserSearch] = useState("");
  const [giftUserSearchDebounced, setGiftUserSearchDebounced] = useState("");
  const [giftSelectedUser, setGiftSelectedUser] = useState<AdminUser | null>(null);
  const [giftAmount, setGiftAmount] = useState<string>("");
  const [giftSubmitting, setGiftSubmitting] = useState(false);

  // Pagination states
  const [txPage, setTxPage] = useState(1);
  const [accPage, setAccPage] = useState(1);
  const ITEMS_PER_PAGE = 8;

  // Search filter states
  const [txSearch, setTxSearch] = useState("");
  const [accSearch, setAccSearch] = useState("");

  // Transaction filters
  const [txPriceRange, setTxPriceRange] = useState<string>("All");
  const [txUserFilter, setTxUserFilter] = useState<string>("All");

  // Account filters
  const [accGameFilter, setAccGameFilter] = useState<string>("All");
  const [accPriceRange, setAccPriceRange] = useState<string>("All");
  const [accStatusFilter, setAccStatusFilter] = useState<string>("All");

  // Add account form states
  const [id, setId] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [price, setPrice] = useState<number>(90000);
  const [originalPrice, setOriginalPrice] = useState<number>(185000);
  const [displayOriginalPrice, setDisplayOriginalPrice] = useState<string>("185.000");
  const [discount, setDiscount] = useState<number>(10);
  const [accountFileContent, setAccountFileContent] = useState<string>("");
  const [accountFileName, setAccountFileName] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [chronoCrystals, setChronoCrystals] = useState<number>(25000);
  const [stars, setStars] = useState<string>("★ 8 Sao VIP");
  const [server, setServer] = useState<string>("Global (Android & iOS)");
  const [powerLevel, setPowerLevel] = useState<number>(100);
  const [characters, setCharacters] = useState<string>(
    "UL Vegito Blue, LL Super Goku",
  );
  const [details, setDetails] = useState<string>(
    "Acc sạch 100%, bảo hành 30 ngày lỗi hoàn bổ sung",
  );
  const [accountUser, setAccountUser] = useState<string>("");
  const [accountPass, setAccountPass] = useState<string>("");
  const [transferCode, setTransferCode] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(15);
  const [imageUrl, setImageUrl] = useState<string>("");
  // Ảnh đã chọn nhưng KHOAN upload — chỉ presign + upload khi bấm "Đăng bán".
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  // Ảnh edit đã chọn nhưng KHOAN upload — chỉ presign + upload khi bấm "Cập nhật".
  const [pendingEditImageFile, setPendingEditImageFile] = useState<File | null>(null);
  const [uploadingEditImage, setUploadingEditImage] = useState(false);

  // Edit account form states
  const [editId, setEditId] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editPrice, setEditPrice] = useState(0);
  const [editOriginalPrice, setEditOriginalPrice] = useState(0);
  const [displayEditOriginalPrice, setDisplayEditOriginalPrice] = useState("");
  const [editDiscount, setEditDiscount] = useState(10);
  const [editCategory, setEditCategory] = useState("");
  const [editChronoCrystals, setEditChronoCrystals] = useState(0);
  const [editStars, setEditStars] = useState("");
  const [editServer, setEditServer] = useState("");
  const [editPowerLevel, setEditPowerLevel] = useState(0);
  const [editCharacters, setEditCharacters] = useState("");
  const [editDetails, setEditDetails] = useState("");
  const [editAccountUser, setEditAccountUser] = useState("");
  const [editAccountPass, setEditAccountPass] = useState("");
  const [editTransferCode, setEditTransferCode] = useState("");
  const [editQuantity, setEditQuantity] = useState<number>(1);
  const [editImageUrl, setEditImageUrl] = useState<string>("");
  const [editStatus, setEditStatus] = useState<"Available" | "Sold">("Available");
  const [editAccountFileContent, setEditAccountFileContent] = useState("");
  const [editAccountFileName, setEditAccountFileName] = useState("");
  const [accountItems, setAccountItems] = useState<any[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);

  useEffect(() => {
    if (selectedAcc) {
      setLoadingItems(true);
      api.get<{ data: any[] }>(`/admin/accounts/${selectedAcc.id}/items?limit=10000`)
        .then((res) => {
          setAccountItems(res.data || []);
        })
        .catch((err: any) => {
          addToast("Không thể tải danh sách tài khoản: " + err.message, "error");
        })
        .finally(() => {
          setLoadingItems(false);
        });
    } else {
      setAccountItems([]);
    }
  }, [selectedAcc, addToast]);

  const [notif, setNotif] = useState<string>(
    "",
  );

  // Category CRUD states
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingCategoryOldName, setEditingCategoryOldName] = useState<string | null>(null);
  const [editingCategoryNewName, setEditingCategoryNewName] = useState("");
  const [deleteCategoryConfirm, setDeleteCategoryConfirm] = useState<string | null>(null);

  // Đồng bộ category đang chọn với danh sách category thực tế.
  // Khi categories từ API load xong (khác với default localStorage), nếu giá trị đang chọn
  // KHÔNG còn nằm trong danh sách thì snap về phần tử đầu — tránh gửi lên 1 category "ma"
  // (select hiển thị option đầu nhưng state vẫn giữ giá trị cũ không có trong options).
  useEffect(() => {
    if (categories.length > 0 && !categories.includes(category)) {
      setCategory(categories[0]);
    }
  }, [categories, category]);

  const handleAddCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) {
      addToast("Vui lòng nhập tên danh mục!", "error");
      return;
    }
    if (categories.includes(newCategoryName.trim())) {
      addToast("Danh mục này đã tồn tại!", "error");
      return;
    }
    onAddCategory(newCategoryName.trim());
    setNewCategoryName("");
  };

  const startEditCategory = (cat: string) => {
    setEditingCategoryOldName(cat);
    setEditingCategoryNewName(cat);
  };

  const handleEditCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategoryNewName.trim()) {
      addToast("Tên danh mục không được để trống!", "error");
      return;
    }
    if (categories.includes(editingCategoryNewName.trim()) && editingCategoryNewName.trim() !== editingCategoryOldName) {
      addToast("Tên danh mục này đã tồn tại!", "error");
      return;
    }
    onEditCategory(editingCategoryOldName!, editingCategoryNewName.trim());
    setEditingCategoryOldName(null);
    setEditingCategoryNewName("");
  };

  // Content Sub-tabs
  const [contentSubTab, setContentSubTab] = useState<"home" | "recharge">("home");

  // Web content local form states
  const [localTicker, setLocalTicker] = useState(tickerNews);
  const [localAtmBank, setLocalAtmBank] = useState(atmBank);
  const [localAtmNumber, setLocalAtmNumber] = useState(atmAccountNumber);
  const [localAtmOwner, setLocalAtmOwner] = useState(atmAccountOwner);
  const [localMomoPhone, setLocalMomoPhone] = useState(momoPhone);
  const [localMomoOwner, setLocalMomoOwner] = useState(momoAccountOwner);
  const [localPhone, setLocalPhone] = useState(footerPhone);
  const [localZalo, setLocalZalo] = useState(footerZalo);
  const [localFacebook, setLocalFacebook] = useState(footerFacebook);
  const [localBrandName, setLocalBrandName] = useState(footerBrandName);
  const [localAboutText, setLocalAboutText] = useState(footerAboutText);
  const [localHours, setLocalHours] = useState(footerHours);
  const [localPolicy, setLocalPolicy] = useState(footerPolicy);
  const [localCopyright, setLocalCopyright] = useState(footerCopyright);

  // Synchronize local states when props change
  useEffect(() => {
    setLocalTicker(tickerNews);
    setLocalAtmBank(atmBank);
    setLocalAtmNumber(atmAccountNumber);
    setLocalAtmOwner(atmAccountOwner);
    setLocalMomoPhone(momoPhone);
    setLocalMomoOwner(momoAccountOwner);
    setLocalPhone(footerPhone);
    setLocalZalo(footerZalo);
    setLocalFacebook(footerFacebook);
    setLocalBrandName(footerBrandName);
    setLocalAboutText(footerAboutText);
    setLocalHours(footerHours);
    setLocalPolicy(footerPolicy);
    setLocalCopyright(footerCopyright);
  }, [tickerNews, atmBank, atmAccountNumber, atmAccountOwner, momoPhone, momoAccountOwner, footerPhone, footerZalo, footerFacebook, footerBrandName, footerAboutText, footerHours, footerPolicy, footerCopyright]);

  const handleOriginalPriceChange = (val: string) => {
    const cleanDigits = val.replace(/\D/g, "");
    if (!cleanDigits) {
      setDisplayOriginalPrice("");
      setOriginalPrice(0);
      return;
    }
    const num = parseInt(cleanDigits, 10);
    setOriginalPrice(num);
    setDisplayOriginalPrice(num.toLocaleString("vi-VN"));
  };

  const handleEditOriginalPriceChange = (val: string) => {
    const cleanDigits = val.replace(/\D/g, "");
    if (!cleanDigits) {
      setDisplayEditOriginalPrice("");
      setEditOriginalPrice(0);
      return;
    }
    const num = parseInt(cleanDigits, 10);
    setEditOriginalPrice(num);
    setDisplayEditOriginalPrice(num.toLocaleString("vi-VN"));
  };

  const handleDownloadTemplate = () => {
    const content = "# Dinh dang tài khoan:\n# TaiKhoan|MatKhau\n# hoac\n# TaiKhoan|MatKhau|MaChuyenCode\n\ntaikhoan1@gmail.com|matkhau123\ntaikhoan2@gmail.com|matkhau456|transfercode789\n";
    const blob = new Blob([content], { type: "text/plain;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "template_accounts.txt");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAddSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title || !accountFileContent) {
      addToast(
        "Vui lòng điền đầy đủ Tên sản phẩm và tải file tài khoản!",
        "error"
      );
      return;
    }

    // Tới đây user mới bấm "Đăng bán": giờ mới gọi presign + upload ảnh đang chờ.
    let finalImageUrl = imageUrl.trim();
    if (pendingImageFile) {
      setUploadingImage(true);
      try {
        finalImageUrl = await uploadImage(pendingImageFile);
        addToast("Tải ảnh lên thành công!", "success");
      } catch (err: any) {
        addToast("Tải ảnh thất bại: " + (err?.message || "Lỗi không xác định"), "error");
        setUploadingImage(false);
        return; // upload lỗi -> không tạo account
      }
      setUploadingImage(false);
    }

    const generatedId = "DBL-" + Math.floor(100000 + Math.random() * 900000);
    const calculatedPrice = Math.round(originalPrice * (1 - discount / 100));

    // Parse credentials from the uploaded file for frontend state consistency
    const lines = accountFileContent.split(/\r?\n/).filter(line => line.trim().length > 0 && !line.startsWith("#"));
    let parsedUser = "File";
    let parsedPass = "Attached";
    let parsedTransferCode: string | undefined = undefined;

    if (lines.length > 0) {
      const parts = lines[0].split("|").map(p => p.trim());
      if (parts[0]) parsedUser = parts[0];
      if (parts[1]) parsedPass = parts[1];
      if (parts[2]) parsedTransferCode = parts[2];
    }

    const calculatedQty = lines.length || 1;

    const newGameAccount: any = {
      id: generatedId,
      game: "Dragon Ball Legends",
      category: category,
      title: title.trim(),
      price: calculatedPrice,
      originalPrice: originalPrice,
      discountPercentage: discount,
      imageUrl: finalImageUrl || "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80",
      avatarUrl: finalImageUrl || "https://images.unsplash.com/photo-1563089145-599997674d42?w=100&auto=format&fit=crop&q=80",
      quantity: calculatedQty,
      fileContent: accountFileContent, // This will be sent to the API
      stats: {
        chronoCrystals: chronoCrystals,
        vipCharacters: [],
        powerLevel: powerLevel,
        starsCount: stars,
        server: server.trim() || "Global (Android & iOS)",
      },
      details: ["Giao dịch tự động siêu tốc", "Cam kết an toàn và sạch sẽ"],
      status: "Available",
      credentials: {
        username: parsedUser,
        pass: parsedPass,
        transferCode: parsedTransferCode,
      },
    };

    onAddAccount(newGameAccount);
    setNotif(`Đã đăng bán thành công tài khoản mã ${generatedId}!`);
    setTimeout(() => setNotif(""), 3000);

    // Reset form states & close modal
    setTitle("");
    setDisplayOriginalPrice("185.000");
    setOriginalPrice(185000);
    setDiscount(10);
    setImageUrl("");
    setPendingImageFile(null);
    setAccountFileContent("");
    setAccountFileName("");
    setShowAddForm(false);
  };

  const startEditAccount = (acc: GameAccount) => {
    setEditId(acc.id);
    setEditTitle(acc.title);
    setEditPrice(acc.price);
    setEditOriginalPrice(acc.originalPrice);
    setDisplayEditOriginalPrice(acc.originalPrice.toLocaleString("vi-VN"));
    const calculatedDiscount = acc.originalPrice > 0
      ? Math.round((1 - acc.price / acc.originalPrice) * 100)
      : 0;
    setEditDiscount(calculatedDiscount);
    setEditCategory(acc.category);
    setEditChronoCrystals(acc.stats.chronoCrystals || 0);
    setEditStars(acc.stats.starsCount || "");
    setEditServer(acc.stats.server || "");
    setEditPowerLevel(acc.stats.powerLevel || 0);
    setEditCharacters(acc.stats.vipCharacters?.join(", ") || "");
    setEditDetails(acc.details?.join(", ") || "");
    setEditAccountUser(acc.credentials?.username || "");
    setEditAccountPass(acc.credentials?.pass || "");
    setEditTransferCode(acc.credentials?.transferCode || "");
    setEditStatus(acc.status);
    setEditQuantity(acc.quantity || 1);
    setEditImageUrl(acc.imageUrl || "");
    setPendingEditImageFile(null);
    setEditAccountFileContent("");
    setEditAccountFileName("");

    setLoadingItems(true);
    api.get<{ data: any[] }>(`/admin/accounts/${acc.id}/items?limit=10000`)
      .then((res) => {
        const availableItems = (res.data || []).filter((item: any) => item.status === "Available" || !item.isSold);
        const fileContentString = availableItems.map((item: any) => {
          if (item.transferCode) {
            return `${item.username}|${item.password}|${item.transferCode}`;
          }
          return `${item.username}|${item.password}`;
        }).join("\n");
        setEditAccountFileContent(fileContentString);
      })
      .catch((err: any) => {
        addToast("Không thể tải danh sách tài khoản: " + err.message, "error");
      })
      .finally(() => {
        setLoadingItems(false);
      });

    setSelectedAcc(null); // Close detail modal if open
    setEditingAcc(acc);
  };

  const handleEditSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!editId || !editTitle) {
      addToast("Vui lòng điền các trường bắt buộc!", "error");
      return;
    }

    // Tới đây user mới bấm "Cập nhật": giờ mới gọi presign + upload ảnh đang chờ.
    let finalImageUrl = editImageUrl.trim();
    if (pendingEditImageFile) {
      setUploadingEditImage(true);
      try {
        finalImageUrl = await uploadImage(pendingEditImageFile);
        addToast("Tải ảnh lên thành công!", "success");
      } catch (err: any) {
        addToast("Tải ảnh thất bại: " + (err?.message || "Lỗi không xác định"), "error");
        setUploadingEditImage(false);
        return; // upload lỗi -> không cập nhật account
      }
      setUploadingEditImage(false);
    }

    const calculatedPrice = Math.round(editOriginalPrice * (1 - editDiscount / 100));

    const updatedAcc: any = {
      ...editingAcc!,
      id: editId.trim().toUpperCase(),
      category: editCategory,
      title: editTitle.trim(),
      price: calculatedPrice,
      originalPrice: editOriginalPrice,
      imageUrl: finalImageUrl || editingAcc!.imageUrl,
      avatarUrl: finalImageUrl || editingAcc!.avatarUrl,
      fileContent: editAccountFileContent,
      stats: {
        ...editingAcc!.stats,
        chronoCrystals: editChronoCrystals,
        powerLevel: editPowerLevel,
        starsCount: editStars,
        server: editServer.trim() || editingAcc!.stats?.server,
      },
    };

    onEditAccount?.(updatedAcc);
    setPendingEditImageFile(null);
    setNotif(`Đã cập nhật thành công tài khoản mã ${editId}!`);
    setTimeout(() => setNotif(""), 3000);
    setEditingAcc(null);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      try {
        const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
        if (lines.length < 2) {
          addToast("File không có dữ liệu hoặc thiếu tiêu đề!", "error");
          return;
        }

        const header = lines[0];
        let sep = ",";
        if (header.includes("\t")) {
          sep = "\t";
        } else if (header.includes(";")) {
          sep = ";";
        }

        const headers = header.split(sep).map(h => h.trim().toLowerCase());

        let importedCount = 0;
        let duplicateCount = 0;

        for (let i = 1; i < lines.length; i++) {
          const row = lines[i].split(sep).map(val => val.trim().replace(/^["']|["']$/g, ''));
          if (row.length < 4) continue;

          const getVal = (colNames: string[]) => {
            const index = headers.findIndex(h => colNames.includes(h));
            return index !== -1 ? row[index] : "";
          };

          const rowId = getVal(["id", "ma", "mã", "mã số", "code"]).toUpperCase();
          const rowTitle = getVal(["title", "tieu de", "tiêu đề", "ten", "tên"]);
          const rowPrice = Number(getVal(["price", "gia", "giá", "giá bán"])) || 50000;
          const rowOrigPrice = Number(getVal(["originalprice", "original price", "giá gốc", "gia goc"])) || rowPrice * 2;
          const rowCategory = getVal(["category", "danh muc", "danh mục"]) || categories[0] || "DANH MỤC ACC Android";
          const rowUser = getVal(["username", "user", "tai khoan", "tài khoản", "gmail", "login"]);
          const rowPass = getVal(["password", "pass", "mat khau", "mật khẩu"]);
          const rowTransfer = getVal(["transfercode", "transfer code", "mã chuyển", "code chuyển"]);
          const rowCrystals = Number(getVal(["crystals", "gems", "kim cuong", "kim cương", "cc"])) || 0;
          const rowStars = Number(getVal(["stars", "sao", "rank", "hạng sao"])) || 0;
          const rowQty = Number(getVal(["quantity", "qty", "so luong", "số lượng"])) || 15;
          const rowImage = getVal(["imageurl", "image url", "ảnh", "anh", "image", "link anh", "link ảnh"]);

          if (!rowId || !rowTitle || !rowUser || !rowPass) {
            continue;
          }

          if (accounts.some(acc => acc.id === rowId)) {
            duplicateCount++;
            continue;
          }

          const parsedCharacters = getVal(["characters", "nhân vật", "vip characters"])
            .split("|")
            .map(c => c.trim())
            .filter(Boolean);

          const parsedDetails = getVal(["details", "mô tả", "detail"])
            .split("|")
            .map(d => d.trim())
            .filter(Boolean);

          const newAcc: GameAccount = {
            id: rowId,
            game: "Dragon Ball Legends",
            category: rowCategory,
            title: rowTitle,
            price: rowPrice,
            originalPrice: rowOrigPrice,
            imageUrl: rowImage || "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80",
            avatarUrl: rowImage || "https://images.unsplash.com/photo-1563089145-599997674d42?w=100&auto=format&fit=crop&q=80",
            quantity: rowQty,
            stats: {
              chronoCrystals: rowCrystals,
              vipCharacters: parsedCharacters.length > 0 ? parsedCharacters : ["Reroll Starter"],
              powerLevel: Math.floor(rowCrystals / 400) + 10,
              starsCount: rowStars > 0 ? `★ ${rowStars} Sao VIP` : "",
              server: "Global (Android & iOS)",
            },
            details: parsedDetails.length > 0 ? parsedDetails : ["Giao dịch tự động siêu tốc", "Bảo hành 1 đổi 1"],
            status: "Available",
            credentials: {
              username: rowUser,
              pass: rowPass,
              transferCode: rowTransfer || undefined,
            }
          };

          onAddAccount(newAcc);
          importedCount++;
        }

        if (importedCount > 0) {
          addToast(`Import thành công ${importedCount} tài khoản!${duplicateCount > 0 ? ` (Bỏ qua ${duplicateCount} mã trùng)` : ''}`, "success");
        } else {
          addToast(`Không thêm được tài khoản nào. Vui lòng kiểm tra lại cấu trúc file!${duplicateCount > 0 ? ` (${duplicateCount} mã bị trùng lặp)` : ''}`, "warning");
        }
      } catch (err) {
        addToast("Lỗi khi đọc file CSV! Đảm bảo định dạng chuẩn.", "error");
      }
    };

    reader.readAsText(file);
    e.target.value = "";
  };

  // Compute stat metrics
  const totalRevenue = dashboardStats
    ? dashboardStats.totalRevenue
    : transactions
      .filter((tx) => tx.type === "buy_account" || tx.type === "wheel_spin")
      .reduce((sum, tx) => sum + tx.amount, 0);

  const totalRecharged = dashboardStats
    ? dashboardStats.totalRecharged
    : transactions
      .filter((tx) => tx.type === "card" || tx.type === "atm")
      .reduce((sum, tx) => sum + tx.amount, 0);

  // Extract unique users list dynamically
  const uniqueUsers = Array.from(new Set(transactions.map((t) => t.username))).filter(Boolean);

  // Debounced search terms — tránh gọi API mỗi lần gõ phím
  const [txSearchDebounced, setTxSearchDebounced] = useState("");
  const [accSearchDebounced, setAccSearchDebounced] = useState("");

  useEffect(() => {
    const h = setTimeout(() => {
      setTxSearchDebounced(txSearch.trim());
      setTxPage(1);
    }, 400);
    return () => clearTimeout(h);
  }, [txSearch]);

  useEffect(() => {
    const h = setTimeout(() => {
      setAccSearchDebounced(accSearch.trim());
      setAccPage(1);
    }, 400);
    return () => clearTimeout(h);
  }, [accSearch]);

  useEffect(() => {
    const h = setTimeout(() => {
      setGiftUserSearchDebounced(giftUserSearch.trim());
    }, 400);
    return () => clearTimeout(h);
  }, [giftUserSearch]);

  // Danh sách người dùng để chọn khi tặng tiền (chỉ fetch khi mở modal)
  const usersQuery = useQuery({
    queryKey: ["users", "admin", giftUserSearchDebounced],
    queryFn: () =>
      api.get<PagedResult<AdminUser>>("/admin/users", {
        params: {
          search: giftUserSearchDebounced || undefined,
          page: 1,
          limit: 20,
        },
      }),
    enabled: giftModalOpen,
    placeholderData: keepPreviousData,
  });
  const giftUsers = usersQuery.data?.data ?? [];

  const openGiftModal = () => {
    setGiftSelectedUser(null);
    setGiftUserSearch("");
    setGiftUserSearchDebounced("");
    setGiftAmount("");
    setGiftModalOpen(true);
  };

  const handleGiftSubmit = async () => {
    if (!giftSelectedUser) {
      addToast("Vui lòng chọn người dùng cần tặng tiền!", "error");
      return;
    }
    const amount = Number(giftAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      addToast("Số tiền tặng phải lớn hơn 0!", "error");
      return;
    }

    setGiftSubmitting(true);
    try {
      const res = await api.post<{ message: string; user: AdminUser }>(
        `/admin/users/${giftSelectedUser.id}/gift-balance`,
        { amount }
      );
      addToast(res.message || "Tặng tiền thành công!", "success");
      setGiftModalOpen(false);
      // Làm mới giao dịch + dashboard để phản ánh khoản tặng
      queryClient.invalidateQueries({ queryKey: ["transactions", "admin"] });
      queryClient.invalidateQueries({ queryKey: ["users", "admin"] });
    } catch (err: any) {
      addToast(err?.message || "Tặng tiền thất bại!", "error");
    } finally {
      setGiftSubmitting(false);
    }
  };

  // Quy đổi các "bucket" khoảng giá ở UI sang tham số min/max gửi cho server
  const txAmountRange = (() => {
    switch (txPriceRange) {
      case "under_50k": return { min: undefined, max: 50000 };
      case "50k_200k": return { min: 50000, max: 200000 };
      case "200k_500k": return { min: 200000, max: 500000 };
      case "over_500k": return { min: 500000, max: undefined };
      default: return { min: undefined, max: undefined };
    }
  })();

  const accPriceRangeParams = (() => {
    switch (accPriceRange) {
      case "under_100k": return { min: undefined, max: 100000 };
      case "100k_300k": return { min: 100000, max: 300000 };
      case "300k_1m": return { min: 300000, max: 1000000 };
      case "over_1m": return { min: 1000000, max: undefined };
      default: return { min: undefined, max: undefined };
    }
  })();

  // Giao dịch — phân trang server (chỉ fetch khi đang ở tab giao dịch)
  const txQuery = useQuery({
    queryKey: ["transactions", "admin", txSearchDebounced, txUserFilter, txPriceRange, txPage],
    queryFn: () =>
      api.get<PagedResult<Transaction>>("/admin/transactions", {
        params: {
          search: txSearchDebounced || undefined,
          username: txUserFilter !== "All" ? txUserFilter : undefined,
          minAmount: txAmountRange.min,
          maxAmount: txAmountRange.max,
          page: txPage,
          limit: ITEMS_PER_PAGE,
        },
      }),
    enabled: activeTab === "transactions",
    placeholderData: keepPreviousData,
  });

  // Sản phẩm acc — phân trang server (chỉ fetch khi đang ở tab acc)
  const accQuery = useQuery({
    queryKey: ["accounts", "admin", accSearchDebounced, accGameFilter, accStatusFilter, accPriceRange, accPage],
    queryFn: () =>
      api.get<PagedResult<any>>("/admin/accounts", {
        params: {
          search: accSearchDebounced || undefined,
          category: accGameFilter !== "All" ? accGameFilter : undefined,
          status: accStatusFilter !== "All" ? accStatusFilter : undefined,
          minPrice: accPriceRangeParams.min,
          maxPrice: accPriceRangeParams.max,
          page: accPage,
          limit: ITEMS_PER_PAGE,
        },
      }),
    enabled: activeTab === "accounts",
    placeholderData: keepPreviousData,
  });

  const paginatedTxs = txQuery.data?.data ?? [];
  const totalTxPages = Math.max(1, txQuery.data?.totalPages ?? 1);
  const totalTxItems = txQuery.data?.totalItems ?? 0;

  // Map AccountDto (stock/isActive) -> hình dạng GameAccount mà bảng & form đang dùng
  const paginatedAccs: GameAccount[] = (accQuery.data?.data ?? []).map((acc: any) => ({
    ...acc,
    quantity: acc.stock,
    status: acc.stock > 0 ? "Available" : "Sold",
  }));
  const totalAccPages = Math.max(1, accQuery.data?.totalPages ?? 1);
  const totalAccItems = accQuery.data?.totalItems ?? 0;

  // Helper to query account purchaser
  const getBuyerUsername = (accountId: string) => {
    const tx = transactions.find(
      (t) => t.type === "buy_account" && t.description.includes(accountId)
    );
    return tx ? tx.username : "Không rõ";
  };

  // --- DASHBOARD DATA PROCESSING ---
  // 1. Monthly Revenue Chart (type: buy_account, wheel_spin)
  const monthlyRevenueData: { [key: string]: number } = {};
  if (dashboardStats?.monthlyRevenue) {
    dashboardStats.monthlyRevenue.forEach((item) => {
      monthlyRevenueData[item.month] = item.revenue;
    });
  } else {
    transactions.forEach((tx) => {
      if (tx.type === "buy_account" || tx.type === "wheel_spin") {
        const match = tx.time.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
        let monthKey = "06/2026";
        if (match) {
          const m = match[2].length === 1 ? "0" + match[2] : match[2];
          monthKey = `${m}/${match[3]}`;
        }
        monthlyRevenueData[monthKey] = (monthlyRevenueData[monthKey] || 0) + tx.amount;
      }
    });
  }

  // Ensure current and previous months are represented
  const curMonthVal = new Date().getMonth() + 1;
  const currentMonthStr = `${curMonthVal < 10 ? "0" + curMonthVal : curMonthVal}/${new Date().getFullYear()}`;
  const prevMonthVal = new Date().getMonth() === 0 ? 12 : new Date().getMonth();
  const prevYearVal = new Date().getMonth() === 0 ? new Date().getFullYear() - 1 : new Date().getFullYear();
  const prevMonthStr = `${prevMonthVal < 10 ? "0" + prevMonthVal : prevMonthVal}/${prevYearVal}`;

  if (Object.keys(monthlyRevenueData).length === 0) {
    if (dashboardStats) {
      monthlyRevenueData[prevMonthStr] = 0;
      monthlyRevenueData[currentMonthStr] = 0;
    } else {
      // Seed with mock data for display aesthetics if empty
      monthlyRevenueData[prevMonthStr] = 850000;
      monthlyRevenueData[currentMonthStr] = 450000;
    }
  } else {
    if (monthlyRevenueData[currentMonthStr] === undefined) monthlyRevenueData[currentMonthStr] = 0;
    if (monthlyRevenueData[prevMonthStr] === undefined) monthlyRevenueData[prevMonthStr] = 0;
  }

  const sortedMonths = Object.keys(monthlyRevenueData).sort((a, b) => {
    const [ma, ya] = a.split("/").map(Number);
    const [mb, yb] = b.split("/").map(Number);
    return ya !== yb ? ya - yb : ma - mb;
  });

  const maxRevenue = Math.max(...Object.values(monthlyRevenueData), 100000);

  // 2. Sales Status Ratio (Available vs. Sold)
  const soldCount = accounts.filter((a) => a.status === "Sold").length;
  const availableCount = dashboardStats ? dashboardStats.availableAccounts : accounts.filter((a) => a.status === "Available").length;
  const maxProductStat = Math.max(soldCount, availableCount, 5);

  // 3. Recharge Methods Donut Chart
  let momoSum = 0;
  let bankSum = 0;
  let cardSum = 0;
  if (dashboardStats?.rechargeMethods) {
    dashboardStats.rechargeMethods.forEach((item) => {
      if (item.method === "momo") momoSum = item.amount;
      else if (item.method === "atm") bankSum = item.amount;
      else if (item.method === "card") cardSum = item.amount;
    });
  } else {
    transactions.forEach((tx) => {
      if (tx.type === "atm") {
        if (tx.description.toLowerCase().includes("momo")) {
          momoSum += tx.amount;
        } else {
          bankSum += tx.amount;
        }
      } else if (tx.type === "card") {
        cardSum += tx.amount;
      }
    });
  }

  // Fallbacks if no data exists
  if (momoSum === 0 && bankSum === 0 && cardSum === 0) {
    if (dashboardStats) {
      momoSum = 0;
      bankSum = 0;
      cardSum = 0;
    } else {
      momoSum = 1200000;
      bankSum = 2500000;
      cardSum = 800000;
    }
  }
  const totalRechargeSum = momoSum + bankSum + cardSum;

  const totalAccountsCount = dashboardStats ? dashboardStats.totalAccounts : accounts.length;

  return (
    <div className="max-w-6xl mx-auto my-6 space-y-8 text-stone-200">
      {/* Header Panel */}
      <div className="flex items-center justify-between border-b-2 border-amber-500/20 pb-4">
        <div className="flex items-center gap-2">
          <Shield className="w-8 h-8 text-rose-500 animate-pulse" />
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-amber-300 uppercase">
              HỆ THỐNG QUẢN TRỊ ADMIN
            </h2>
            <p className="text-xs text-rose-300">
              hainagaming.com - Bảo mật bảng điều khiển nội bộ
            </p>
          </div>
        </div>

        <button
          onClick={onBack}
          id="admin-back-btn"
          className="bg-stone-900/50 hover:bg-rose-500 hover:text-stone-950 text-rose-400 py-1.5 px-4 rounded-xl border border-rose-500/20 text-xs font-bold uppercase transition"
        >
          Đăng xuất
        </button>
      </div>

      {/* Stats row cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-[#2c0404] p-4 rounded-2xl border border-amber-500/15">
          <span className="text-[10px] text-stone-400 block font-bold uppercase">
            Tổng tài khoản đang đăng
          </span>
          <span className="text-xl font-black text-amber-400 font-mono">
            {totalAccountsCount} nick
          </span>
        </div>
        <div className="bg-[#2c0404] p-4 rounded-2xl border border-amber-500/15">
          <span className="text-[10px] text-stone-400 block font-bold uppercase">
            Tài khoản còn trống bán
          </span>
          <span className="text-xl font-black text-emerald-400 font-mono">
            {availableCount} nick
          </span>
        </div>
        <div className="bg-[#2c0404] p-4 rounded-2xl border border-amber-500/15">
          <span className="text-[10px] text-stone-400 block font-bold uppercase">
            Ước tính Doanh Thu mua
          </span>
          <span className="text-xl font-black text-[#ffffff] font-mono">
            {totalRevenue.toLocaleString()} đ
          </span>
        </div>
        <div className="bg-[#2c0404] p-4 rounded-2xl border border-amber-500/15">
          <span className="text-[10px] text-stone-400 block font-bold uppercase">
            Dòng tiền vốn nạp vào hệ thống
          </span>
          <span className="text-xl font-black text-amber-500 font-mono">
            {totalRecharged.toLocaleString()} đ
          </span>
        </div>
      </div>

      {/* Main Grid Wrapper with Left Sidebar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left Sidebar */}
        <div className="md:col-span-3 space-y-4 bg-[#2c0404]/80 p-4 rounded-3xl border border-amber-500/10">
          <div className="space-y-2">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2.5 transition ${activeTab === "dashboard"
                ? "bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20"
                : "text-stone-300 hover:bg-stone-900/50 hover:text-amber-400"
                }`}
            >
              <LayoutDashboard className="w-4 h-4 shrink-0" />
              Bảng điều khiển Dashboard
            </button>
            <button
              onClick={() => setActiveTab("transactions")}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2.5 transition ${activeTab === "transactions"
                ? "bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20"
                : "text-stone-300 hover:bg-stone-900/50 hover:text-amber-400"
                }`}
            >
              <History className="w-4 h-4 shrink-0" />
              Bảng giao dịch hệ thống
            </button>
            <button
              onClick={() => setActiveTab("accounts")}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2.5 transition ${activeTab === "accounts"
                ? "bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20"
                : "text-stone-300 hover:bg-stone-900/50 hover:text-amber-400"
                }`}
            >
              <Inbox className="w-4 h-4 shrink-0" />
              Quản lý Acc Game
            </button>
            <button
              onClick={() => setActiveTab("categories")}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2.5 transition ${activeTab === "categories"
                ? "bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20"
                : "text-stone-300 hover:bg-stone-900/50 hover:text-amber-400"
                }`}
            >
              <Settings className="w-4 h-4 shrink-0" />
              Quản lý Danh mục
            </button>
            <button
              onClick={() => setActiveTab("content")}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2.5 transition ${activeTab === "content"
                ? "bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20"
                : "text-stone-300 hover:bg-stone-900/50 hover:text-amber-400"
                }`}
            >
              <Settings className="w-4 h-4 shrink-0" />
              Chỉnh sửa nội dung web
            </button>
          </div>

          <div className="border-t border-amber-500/10 pt-4 text-center">
            <button
              onClick={openGiftModal}
              className="w-full bg-emerald-700 hover:bg-emerald-600 text-amber-100 py-2 px-3 rounded-xl font-bold text-[10px] border border-amber-500/15 transition flex items-center justify-center gap-1 mx-auto"
            >
              <Gift className="w-3.5 h-3.5" /> TẶNG TIỀN CHO USER
            </button>
          </div>
        </div>

        {/* Right content tab pane */}
        <div className="md:col-span-9 space-y-4">
          {/* TAB 0: DASHBOARD TAB WITH CHARTS */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              {/* Charts grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* 1. Monthly Revenue Chart (Column Chart) */}
                <div className="bg-[#4d0808] p-5 rounded-3xl border border-amber-500/20 shadow-xl space-y-4">
                  <div className="flex items-center justify-between border-b border-amber-500/15 pb-2">
                    <h5 className="font-extrabold uppercase text-xs text-stone-100 flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                      Doanh thu cửa hàng theo tháng
                    </h5>
                    <span className="text-[10px] text-stone-400 font-bold uppercase">Biểu đồ cột</span>
                  </div>

                  <div className="flex justify-center items-center py-2 bg-red-950/20 rounded-2xl border border-amber-500/5">
                    <svg width="100%" height="200" viewBox="0 0 400 200" className="overflow-visible">
                      {/* Grid Lines */}
                      <line x1="40" y1="30" x2="380" y2="30" stroke="#f59e0b" strokeWidth="1" strokeDasharray="3 3" opacity="0.1" />
                      <line x1="40" y1="90" x2="380" y2="90" stroke="#f59e0b" strokeWidth="1" strokeDasharray="3 3" opacity="0.1" />
                      <line x1="40" y1="150" x2="380" y2="150" stroke="#f59e0b" strokeWidth="1" strokeOpacity="0.2" />

                      {/* X & Y Axis */}
                      <line x1="40" y1="30" x2="40" y2="150" stroke="#f59e0b" strokeWidth="1" opacity="0.2" />

                      {/* Render columns */}
                      {sortedMonths.map((m, i) => {
                        const val = monthlyRevenueData[m] || 0;
                        const colHeight = maxRevenue > 0 ? (val / maxRevenue) * 110 : 0;
                        const colWidth = 45;
                        const gap = 40;
                        const startX = 80;
                        const x = startX + i * (colWidth + gap);
                        const y = 150 - colHeight;

                        return (
                          <g key={m} className="group cursor-pointer">
                            {/* Bar gradient / hover effect */}
                            <rect
                              x={x}
                              y={y}
                              width={colWidth}
                              height={Math.max(colHeight, 4)}
                              rx="6"
                              className="fill-amber-500 hover:fill-amber-400 transition-colors duration-200"
                              opacity="0.85"
                            />
                            {/* Value label on top */}
                            <text
                              x={x + colWidth / 2}
                              y={y - 8}
                              textAnchor="middle"
                              className="fill-stone-200 font-mono font-bold text-[9px]"
                            >
                              {val.toLocaleString()}đ
                            </text>
                            {/* X-axis label */}
                            <text
                              x={x + colWidth / 2}
                              y="168"
                              textAnchor="middle"
                              className="fill-stone-400 font-bold text-[9px]"
                            >
                              {m}
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>
                </div>

                {/* 2. Product Sales Ratio (Column Chart) */}
                <div className="bg-[#4d0808] p-5 rounded-3xl border border-amber-500/20 shadow-xl space-y-4">
                  <div className="flex items-center justify-between border-b border-amber-500/15 pb-2">
                    <h5 className="font-extrabold uppercase text-xs text-stone-100 flex items-center gap-1.5">
                      <BarChart3 className="w-4 h-4 text-amber-400" />
                      Tỷ lệ sản phẩm Đã bán / Chưa bán
                    </h5>
                    <span className="text-[10px] text-stone-400 font-bold uppercase">Biểu đồ so sánh</span>
                  </div>

                  <div className="flex justify-center items-center py-2 bg-red-950/20 rounded-2xl border border-amber-500/5">
                    <svg width="100%" height="200" viewBox="0 0 320 200" className="overflow-visible">
                      {/* Grid Lines */}
                      <line x1="40" y1="30" x2="280" y2="30" stroke="#f59e0b" strokeWidth="1" strokeDasharray="3 3" opacity="0.1" />
                      <line x1="40" y1="90" x2="280" y2="90" stroke="#f59e0b" strokeWidth="1" strokeDasharray="3 3" opacity="0.1" />
                      <line x1="40" y1="150" x2="280" y2="150" stroke="#f59e0b" strokeWidth="1" strokeOpacity="0.2" />

                      {/* Bar 1: Available */}
                      {(() => {
                        const hAvail = maxProductStat > 0 ? (availableCount / maxProductStat) * 110 : 0;
                        const yAvail = 150 - hAvail;
                        return (
                          <g className="group cursor-pointer">
                            <rect
                              x="70"
                              y={yAvail}
                              width="50"
                              height={Math.max(hAvail, 4)}
                              rx="6"
                              className="fill-emerald-500 hover:fill-emerald-400 transition-colors duration-200"
                              opacity="0.85"
                            />
                            <text x="95" y={yAvail - 8} textAnchor="middle" className="fill-emerald-300 font-mono font-black text-[10px]">
                              {availableCount}
                            </text>
                            <text x="95" y="168" textAnchor="middle" className="fill-emerald-400 font-extrabold text-[9px]">
                              Chưa bán
                            </text>
                          </g>
                        );
                      })()}

                      {/* Bar 2: Sold */}
                      {(() => {
                        const hSold = maxProductStat > 0 ? (soldCount / maxProductStat) * 110 : 0;
                        const ySold = 150 - hSold;
                        return (
                          <g className="group cursor-pointer">
                            <rect
                              x="180"
                              y={ySold}
                              width="50"
                              height={Math.max(hSold, 4)}
                              rx="6"
                              className="fill-rose-500 hover:fill-rose-400 transition-colors duration-200"
                              opacity="0.85"
                            />
                            <text x="205" y={ySold - 8} textAnchor="middle" className="fill-rose-300 font-mono font-black text-[10px]">
                              {soldCount}
                            </text>
                            <text x="205" y="168" textAnchor="middle" className="fill-rose-400 font-extrabold text-[9px]">
                              Đã bán
                            </text>
                          </g>
                        );
                      })()}
                    </svg>
                  </div>
                </div>

              </div>

              {/* 3. Recharge Methods (Pie/Donut Chart) */}
              <div className="bg-[#4d0808] p-5 rounded-3xl border border-amber-500/20 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-amber-500/15 pb-2">
                  <h5 className="font-extrabold uppercase text-xs text-stone-100 flex items-center gap-1.5">
                    <PieChart className="w-4 h-4 text-purple-400" />
                    Cơ cấu nguồn dòng tiền nạp hệ thống
                  </h5>
                  <span className="text-[10px] text-stone-400 font-bold uppercase">Biểu đồ tròn / Donut</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center py-4 px-2 bg-red-950/20 rounded-2xl border border-amber-500/5">
                  {/* SVG Donut */}
                  <div className="flex justify-center relative">
                    <svg width="160" height="160" viewBox="0 0 120 120" className="transform -rotate-90">
                      {/* Background circle */}
                      <circle cx="60" cy="60" r="50" fill="transparent" stroke="#2c0404" strokeWidth="12" />

                      {/* Render Pie segments using dash offset */}
                      {(() => {
                        const r = 50;
                        const circ = 2 * Math.PI * r; // 314.159

                        const pMomo = totalRechargeSum > 0 ? (momoSum / totalRechargeSum) * 100 : 0;
                        const pBank = totalRechargeSum > 0 ? (bankSum / totalRechargeSum) * 100 : 0;
                        const pCard = totalRechargeSum > 0 ? (cardSum / totalRechargeSum) * 100 : 0;

                        const dMomo = (pMomo / 100) * circ;
                        const dBank = (pBank / 100) * circ;
                        const dCard = (pCard / 100) * circ;

                        return (
                          <>
                            {/* Momo segment - Purple */}
                            {dMomo > 0 && (
                              <circle
                                cx="60"
                                cy="60"
                                r={r}
                                fill="transparent"
                                stroke="#d946ef"
                                strokeWidth="12"
                                strokeDasharray={`${dMomo} ${circ}`}
                                strokeDashoffset={0}
                                className="transition-all duration-300"
                              />
                            )}
                            {/* Bank/ATM segment - Blue */}
                            {dBank > 0 && (
                              <circle
                                cx="60"
                                cy="60"
                                r={r}
                                fill="transparent"
                                stroke="#3b82f6"
                                strokeWidth="12"
                                strokeDasharray={`${dBank} ${circ}`}
                                strokeDashoffset={-dMomo}
                                className="transition-all duration-300"
                              />
                            )}
                            {/* Card segment - Orange */}
                            {dCard > 0 && (
                              <circle
                                cx="60"
                                cy="60"
                                r={r}
                                fill="transparent"
                                stroke="#f97316"
                                strokeWidth="12"
                                strokeDasharray={`${dCard} ${circ}`}
                                strokeDashoffset={-(dMomo + dBank)}
                                className="transition-all duration-300"
                              />
                            )}
                          </>
                        );
                      })()}
                    </svg>

                    {/* Donut Center Label */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Tổng nạp</span>
                      <span className="text-sm font-black text-amber-300 font-mono">
                        {totalRechargeSum.toLocaleString()}đ
                      </span>
                    </div>
                  </div>

                  {/* Legends & percentages */}
                  <div className="space-y-3 font-semibold text-xs text-stone-300">
                    <div className="flex items-center justify-between border-b border-amber-500/5 pb-1">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-purple-500 shrink-0" />
                        <span>Ví điện tử MoMo</span>
                      </div>
                      <span className="font-mono text-[#ffffff] font-bold">
                        {momoSum.toLocaleString()}đ ({totalRechargeSum > 0 ? Math.round((momoSum / totalRechargeSum) * 100) : 0}%)
                      </span>
                    </div>

                    <div className="flex items-center justify-between border-b border-amber-500/5 pb-1">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-blue-500 shrink-0" />
                        <span>Ngân hàng (ATM)</span>
                      </div>
                      <span className="font-mono text-[#ffffff] font-bold">
                        {bankSum.toLocaleString()}đ ({totalRechargeSum > 0 ? Math.round((bankSum / totalRechargeSum) * 100) : 0}%)
                      </span>
                    </div>

                    <div className="flex items-center justify-between border-b border-amber-500/5 pb-1">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-orange-500 shrink-0" />
                        <span>Nạp thẻ cào tự động</span>
                      </div>
                      <span className="font-mono text-[#ffffff] font-bold">
                        {cardSum.toLocaleString()}đ ({totalRechargeSum > 0 ? Math.round((cardSum / totalRechargeSum) * 100) : 0}%)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: TRANSACTIONS LIST */}
          {activeTab === "transactions" && (
            <div className="bg-[#4d0808] p-5 rounded-3xl border border-amber-500/20 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-amber-500/15">
                <h4 className="font-extrabold uppercase text-sm text-stone-100 flex items-center gap-1.5">
                  <History className="w-4 h-4 text-amber-400" />
                  Bảng giao dịch hệ thống ({totalTxItems})
                </h4>

                {/* Search query input */}
                <div className="relative max-w-xs w-full">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Tìm giao dịch, User, loại..."
                    value={txSearch}
                    onChange={(e) => setTxSearch(e.target.value)}
                    className="w-full bg-red-950/80 border border-amber-500/15 rounded-xl py-1.5 pl-9 pr-4 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Advanced transaction filters */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-red-950/20 rounded-2xl border border-amber-500/10 text-xs">
                <div>
                  <label className="block text-[10px] text-stone-400 uppercase font-black mb-1">Chọn Người Dùng</label>
                  <select
                    value={txUserFilter}
                    onChange={(e) => {
                      setTxUserFilter(e.target.value);
                      setTxPage(1);
                    }}
                    className="w-full bg-red-950/80 border border-amber-500/15 rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 text-stone-200 font-bold"
                  >
                    <option value="All">Tất cả Người dùng</option>
                    {uniqueUsers.map((user) => (
                      <option key={user} value={user}>
                        {user}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-stone-400 uppercase font-black mb-1">Khoảng Giá Biến Động</label>
                  <select
                    value={txPriceRange}
                    onChange={(e) => {
                      setTxPriceRange(e.target.value);
                      setTxPage(1);
                    }}
                    className="w-full bg-red-950/80 border border-amber-500/15 rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 text-stone-200 font-bold"
                  >
                    <option value="All">Tất cả Mức giá</option>
                    <option value="under_50k">Dưới 50,000đ</option>
                    <option value="50k_200k">50,000đ - 200,000đ</option>
                    <option value="200k_500k">200,000đ - 500,000đ</option>
                    <option value="over_500k">Trên 500,000đ</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setTxPriceRange("All");
                      setTxUserFilter("All");
                      setTxSearch("");
                      setTxPage(1);
                    }}
                    className="w-full bg-stone-900/50 hover:bg-amber-500 hover:text-stone-950 text-amber-400 py-2 px-3 rounded-xl border border-amber-500/20 text-[10px] font-black uppercase transition cursor-pointer"
                  >
                    Reset Bộ lọc
                  </button>
                </div>
              </div>

              {paginatedTxs.length === 0 ? (
                <EmptyState
                  title="Không tìm thấy giao dịch"
                  description="Không có lịch sử giao dịch nào phù hợp với bộ lọc tìm kiếm hiện tại."
                  iconType="database"
                  actionText="Reset bộ lọc"
                  onAction={() => {
                    setTxPriceRange("All");
                    setTxUserFilter("All");
                    setTxSearch("");
                    setTxPage(1);
                  }}
                />
              ) : (
                <div className="space-y-4">
                  <div className="overflow-x-auto rounded-xl">
                    <table className="w-full text-xs text-left text-stone-200">
                      <thead className="text-[10px] text-amber-400 uppercase bg-[#2c0404] border-b border-amber-500/20">
                        <tr>
                          <th className="px-3 py-3 text-center w-12">STT</th>
                          <th className="px-3 py-3 w-28">Mã GD</th>
                          <th className="px-3 py-3 w-24">Tài khoản</th>
                          <th className="px-3 py-3">Nội dung</th>
                          <th className="px-3 py-3 text-right w-24">Biến động</th>
                          <th className="px-3 py-3 text-center w-20">Chi tiết</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-amber-500/5 bg-[#2c0404]/30">
                        {paginatedTxs.map((tx, idx) => {
                          const globalIdx = (txPage - 1) * ITEMS_PER_PAGE + idx;
                          return (
                            <tr key={tx.id} className="hover:bg-red-950/20 transition">
                              <td className="px-3 py-3 text-center font-mono font-bold text-stone-400">
                                {globalIdx + 1}
                              </td>
                              <td className="px-3 py-3 font-mono font-black text-rose-300 truncate max-w-[110px]">
                                {tx.id}
                              </td>
                              <td className="px-3 py-3 font-bold text-stone-100">
                                {tx.username}
                              </td>
                              <td className="px-3 py-3 truncate max-w-xs text-stone-300">
                                {tx.description}
                              </td>
                              <td className="px-3 py-3 text-right font-black">
                                {isCreditTx(tx.type) ? (
                                  <span className="text-emerald-400">+{tx.amount.toLocaleString()}đ</span>
                                ) : (
                                  <span className="text-rose-400">-{tx.amount.toLocaleString()}đ</span>
                                )}
                              </td>
                              <td className="px-3 py-3 text-center">
                                <button
                                  onClick={() => setSelectedTx(tx)}
                                  className="p-1 bg-stone-900/50 hover:bg-amber-500 hover:text-stone-950 text-amber-400 rounded-lg border border-amber-500/20 transition inline-flex items-center justify-center cursor-pointer"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination control for transactions */}
                  {totalTxPages > 1 && (
                    <div className="flex items-center justify-center gap-3 pt-2">
                      <button
                        disabled={txPage === 1}
                        onClick={() => setTxPage(txPage - 1)}
                        className="px-3 py-1 bg-stone-900 hover:bg-amber-500 hover:text-stone-950 disabled:opacity-30 disabled:hover:bg-stone-900 disabled:hover:text-amber-400 text-amber-400 text-[10px] font-bold transition uppercase border border-amber-500/20 rounded-lg"
                      >
                        ← Trước
                      </button>
                      <span className="text-[10px] text-stone-400 font-bold">
                        Trang {txPage} / {totalTxPages}
                      </span>
                      <button
                        disabled={txPage === totalTxPages}
                        onClick={() => setTxPage(txPage + 1)}
                        className="px-3 py-1 bg-stone-900 hover:bg-amber-500 hover:text-stone-950 disabled:opacity-30 disabled:hover:bg-stone-900 disabled:hover:text-amber-400 text-amber-400 text-[10px] font-bold transition uppercase border border-amber-500/20 rounded-lg"
                      >
                        Sau →
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: GAME ACCOUNTS MANAGEMENT */}
          {activeTab === "accounts" && (
            <div className="bg-[#4d0808] p-5 rounded-3xl border border-amber-500/20 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-amber-500/15">
                <div className="flex items-center gap-3">
                  <h4 className="font-extrabold uppercase text-sm text-stone-100 flex items-center gap-1.5">
                    <Inbox className="w-4 h-4 text-amber-400" />
                    Danh sách sản phẩm acc ({totalAccItems})
                  </h4>
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="bg-emerald-600 hover:bg-emerald-500 text-stone-950 py-1 px-3 rounded-lg text-[10px] font-black uppercase flex items-center gap-1 transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Đăng Acc Mới
                  </button>
                </div>

                {/* Search accounts query */}
                <div className="relative max-w-xs w-full">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Tìm theo Mã Nick, Tiêu đề..."
                    value={accSearch}
                    onChange={(e) => setAccSearch(e.target.value)}
                    className="w-full bg-red-950/80 border border-amber-500/15 rounded-xl py-1.5 pl-9 pr-4 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Advanced account filters */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-3 bg-red-950/20 rounded-2xl border border-amber-500/10 text-xs">
                <div>
                  <label className="block text-[10px] text-stone-400 uppercase font-black mb-1">Danh mục</label>
                  <select
                    value={accGameFilter}
                    onChange={(e) => {
                      setAccGameFilter(e.target.value);
                      setAccPage(1);
                    }}
                    className="w-full bg-red-950/80 border border-amber-500/15 rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 text-stone-200 font-bold"
                  >
                    <option value="All">Tất cả Danh mục</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-stone-400 uppercase font-black mb-1">Trạng thái</label>
                  <select
                    value={accStatusFilter}
                    onChange={(e) => {
                      setAccStatusFilter(e.target.value);
                      setAccPage(1);
                    }}
                    className="w-full bg-red-950/80 border border-amber-500/15 rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 text-stone-200 font-bold"
                  >
                    <option value="All">Tất cả Trạng thái</option>
                    <option value="Available">Còn hàng</option>
                    <option value="Sold">Hết hàng</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-stone-400 uppercase font-black mb-1">Khoảng Giá ACC</label>
                  <select
                    value={accPriceRange}
                    onChange={(e) => {
                      setAccPriceRange(e.target.value);
                      setAccPage(1);
                    }}
                    className="w-full bg-red-950/80 border border-amber-500/15 rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 text-stone-200 font-bold"
                  >
                    <option value="All">Tất cả Mức giá</option>
                    <option value="under_100k">Dưới 100,000đ</option>
                    <option value="100k_300k">100,000đ - 300,000đ</option>
                    <option value="300k_1m">300,000đ - 1,000,000đ</option>
                    <option value="over_1m">Trên 1,000,000đ</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setAccGameFilter("All");
                      setAccStatusFilter("All");
                      setAccPriceRange("All");
                      setAccSearch("");
                      setAccPage(1);
                    }}
                    className="w-full bg-stone-900/50 hover:bg-amber-500 hover:text-stone-950 text-amber-400 py-2 px-3 rounded-xl border border-amber-500/20 text-[10px] font-black uppercase transition cursor-pointer"
                  >
                    Reset Bộ lọc
                  </button>
                </div>
              </div>

              {paginatedAccs.length === 0 ? (
                <EmptyState
                  title="Không tìm thấy tài khoản"
                  description="Không tìm thấy tài khoản game nào phù hợp với bộ lọc tìm kiếm hiện tại."
                  iconType="folder"
                  actionText="Reset bộ lọc"
                  onAction={() => {
                    setAccGameFilter("All");
                    setAccStatusFilter("All");
                    setAccPriceRange("All");
                    setAccSearch("");
                    setAccPage(1);
                  }}
                />
              ) : (
                <div className="space-y-4">
                  <div className="overflow-x-auto rounded-xl">
                    <table className="w-full text-xs text-left text-stone-200">
                      <thead className="text-[10px] text-amber-400 uppercase bg-[#2c0404] border-b border-amber-500/20">
                        <tr>
                          <th className="px-3 py-3 text-center w-12">STT</th>
                          <th className="px-3 py-3 w-28">Mã Acc</th>
                          <th className="px-3 py-3">Tên Tiêu Đề</th>
                          <th className="px-3 py-3 text-right w-24">Giá Nick</th>
                          <th className="px-3 py-3 text-center w-24">Trạng Thái</th>
                          <th className="px-3 py-3 text-center w-16">Xem</th>
                          <th className="px-3 py-3 text-center w-16">Sửa</th>
                          <th className="px-3 py-3 text-center w-12">Xóa</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-amber-500/5 bg-[#2c0404]/30">
                        {paginatedAccs.map((acc, idx) => {
                          const globalIdx = (accPage - 1) * ITEMS_PER_PAGE + idx;
                          return (
                            <tr key={acc.id} className="hover:bg-red-950/20 transition">
                              <td className="px-3 py-3 text-center font-mono font-bold text-stone-400">
                                {globalIdx + 1}
                              </td>
                              <td className="px-3 py-3 font-mono font-black text-amber-400">
                                {acc.id}
                              </td>
                              <td className="px-3 py-3 truncate max-w-xs font-bold text-stone-200">
                                {acc.title}
                              </td>
                              <td className="px-3 py-3 text-right font-black text-rose-300">
                                {acc.price.toLocaleString()}đ
                              </td>
                              <td className="px-3 py-3 text-center">
                                {acc.status === "Sold" || (acc.quantity !== undefined && acc.quantity <= 0) ? (
                                  <span className="bg-stone-800 text-stone-400 border border-stone-700 py-0.5 px-2 rounded-full text-[10px] font-black inline-block whitespace-nowrap">
                                    Hết hàng
                                  </span>
                                ) : (
                                  <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 py-0.5 px-2 rounded-full text-[10px] font-black inline-block whitespace-nowrap">
                                    Còn hàng ({acc.quantity ?? 1})
                                  </span>
                                )}
                              </td>
                              <td className="px-3 py-3 text-center">
                                <button
                                  onClick={() => setSelectedAcc(acc)}
                                  className="p-1 bg-stone-900/50 hover:bg-amber-500 hover:text-stone-950 text-amber-400 rounded-lg border border-amber-500/20 transition inline-flex items-center justify-center cursor-pointer"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                              </td>
                              <td className="px-3 py-3 text-center">
                                <button
                                  onClick={() => startEditAccount(acc)}
                                  className="p-1 bg-stone-900/50 hover:bg-emerald-500 hover:text-[#1a0202] text-emerald-400 rounded-lg border border-amber-500/20 transition inline-flex items-center justify-center cursor-pointer"
                                >
                                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                </button>
                              </td>
                              <td className="px-3 py-3 text-center">
                                <button
                                  onClick={() => setDeleteConfirmId(acc.id)}
                                  className="p-1.5 bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-400 rounded-lg transition cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination control for accounts */}
                  {totalAccPages > 1 && (
                    <div className="flex items-center justify-center gap-3 pt-2">
                      <button
                        disabled={accPage === 1}
                        onClick={() => setAccPage(accPage - 1)}
                        className="px-3 py-1 bg-stone-900 hover:bg-amber-500 hover:text-stone-950 disabled:opacity-30 disabled:hover:bg-stone-900 disabled:hover:text-amber-400 text-amber-400 text-[10px] font-bold transition uppercase border border-amber-500/20 rounded-lg"
                      >
                        ← Trước
                      </button>
                      <span className="text-[10px] text-stone-400 font-bold">
                        Trang {accPage} / {totalAccPages}
                      </span>
                      <button
                        disabled={accPage === totalAccPages}
                        onClick={() => setAccPage(accPage + 1)}
                        className="px-3 py-1 bg-stone-900 hover:bg-amber-500 hover:text-stone-950 disabled:opacity-30 disabled:hover:bg-stone-900 disabled:hover:text-amber-400 text-amber-400 text-[10px] font-bold transition uppercase border border-amber-500/20 rounded-lg"
                      >
                        Sau →
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: WEB CONTENT CONFIGURATION */}
          {activeTab === "content" && (
            <div className="bg-[#4d0808] p-5 sm:p-6 rounded-3xl border border-amber-500/20 shadow-xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-amber-500/15">
                <h4 className="font-extrabold uppercase text-sm text-stone-100 flex items-center gap-1.5">
                  <Settings className="w-4 h-4 text-amber-400" />
                  Chỉnh sửa nội dung trang web
                </h4>

                {/* Sub-tabs switch */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setContentSubTab("home")}
                    className={`py-1.5 px-4 rounded-xl font-bold text-xs transition uppercase ${contentSubTab === "home"
                      ? "bg-amber-500 text-stone-950 shadow-md font-black"
                      : "bg-stone-900/40 text-stone-300 border border-amber-500/10 hover:bg-stone-900/80"
                      }`}
                  >
                    <Home className="w-3.5 h-3.5 inline mr-1" /> Home
                  </button>
                  {/* <button
                    onClick={() => setContentSubTab("recharge")}
                    className={`py-1.5 px-4 rounded-xl font-bold text-xs transition uppercase ${contentSubTab === "recharge"
                      ? "bg-emerald-500 text-stone-950 shadow-md font-black"
                      : "bg-stone-900/40 text-stone-300 border border-amber-500/10 hover:bg-stone-900/80"
                      }`}
                  >
                    <Coins className="w-3.5 h-3.5 inline mr-1" /> Trang nạp
                  </button> */}
                </div>
              </div>

              {contentSubTab === "home" && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    onUpdateFooterLinks({
                      tickerNews: localTicker,
                      phone: localPhone,
                      zalo: localZalo,
                      facebook: localFacebook,
                      brandName: localBrandName,
                      aboutText: localAboutText,
                      hours: localHours,
                      policy: localPolicy,
                      copyright: localCopyright,
                    });
                    addToast("Cập nhật thông báo và toàn bộ thông tin footer thành công!", "success");
                  }}
                  className="space-y-5"
                >
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-amber-300 uppercase">
                      Nội dung thông báo chạy chữ (Marquee Ticker News)
                    </label>
                    <textarea
                      value={localTicker}
                      onChange={(e) => setLocalTicker(e.target.value)}
                      placeholder="Nhập nội dung thông báo cho trang chủ..."
                      rows={3}
                      className="w-full bg-red-950/80 border border-amber-500/20 rounded-2xl p-4 text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                      required
                    />
                    <p className="text-[10px] text-stone-400 italic">
                      Lưu ý: Thông báo này sẽ hiển thị chạy ngang trên tất cả các trang ngoại trừ giao diện quản trị.
                    </p>
                  </div>

                  <div className="bg-[#2c0404]/80 p-5 rounded-2xl border border-amber-500/10 space-y-4 mt-4">
                    <div className="border-b border-rose-900/40 pb-2">
                      <h5 className="font-extrabold text-xs uppercase text-amber-300 tracking-wider">
                        Cấu hình thông tin liên hệ & Thương hiệu ở Footer
                      </h5>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold text-stone-300 uppercase mb-1">
                          Tên thương hiệu (Brand Name) *
                        </label>
                        <input
                          type="text"
                          value={localBrandName}
                          onChange={(e) => setLocalBrandName(e.target.value)}
                          className="w-full bg-red-950/85 border border-amber-500/20 rounded-xl py-2 px-3 text-xs text-stone-100 font-bold"
                          placeholder="Ví dụ: Hainagaming || Siêu Thị Account Reroll Dragon Ball Legend"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-stone-300 uppercase mb-1">
                          Số điện thoại Hotline *
                        </label>
                        <input
                          type="text"
                          value={localPhone}
                          onChange={(e) => setLocalPhone(e.target.value)}
                          className="w-full bg-red-950/85 border border-amber-500/20 rounded-xl py-2 px-3 text-xs text-stone-100 font-bold"
                          placeholder="Ví dụ: 0399.88.11.22"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-stone-300 uppercase mb-1">
                          Giờ mở cửa (Working Hours) *
                        </label>
                        <input
                          type="text"
                          value={localHours}
                          onChange={(e) => setLocalHours(e.target.value)}
                          className="w-full bg-red-950/85 border border-amber-500/20 rounded-xl py-2 px-3 text-xs text-stone-100 font-bold"
                          placeholder="Ví dụ: 07:00 - 24:00"
                          required
                        />
                      </div>
                      <div className="sm:col-span-2 lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[11px] font-bold text-stone-300 uppercase mb-1">
                            Đường dẫn Zalo hỗ trợ *
                          </label>
                          <input
                            type="text"
                            value={localZalo}
                            onChange={(e) => setLocalZalo(e.target.value)}
                            className="w-full bg-red-950/85 border border-amber-500/20 rounded-xl py-2 px-3 text-xs text-stone-100 font-bold"
                            placeholder="Ví dụ: https://zalo.me/..."
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-stone-300 uppercase mb-1">
                            Đường dẫn Facebook Fanpage *
                          </label>
                          <input
                            type="text"
                            value={localFacebook}
                            onChange={(e) => setLocalFacebook(e.target.value)}
                            className="w-full bg-red-950/85 border border-amber-500/20 rounded-xl py-2 px-3 text-xs text-stone-100 font-bold"
                            placeholder="Ví dụ: https://facebook.com/..."
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 pt-2 border-t border-rose-900/20">
                      <div>
                        <label className="block text-[11px] font-bold text-stone-300 uppercase mb-1">
                          Giới thiệu Footer (About Text) *
                        </label>
                        <textarea
                          value={localAboutText}
                          onChange={(e) => setLocalAboutText(e.target.value)}
                          placeholder="Mô tả ngắn về shop game..."
                          rows={2}
                          className="w-full bg-red-950/85 border border-amber-500/20 rounded-xl p-3 text-xs text-stone-100 font-semibold focus:outline-none focus:ring-1 focus:ring-amber-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-stone-300 uppercase mb-1">
                          Mô tả Điều khoản & Chính sách *
                        </label>
                        <textarea
                          value={localPolicy}
                          onChange={(e) => setLocalPolicy(e.target.value)}
                          placeholder="Thông báo về chính sách mua acc..."
                          rows={2}
                          className="w-full bg-red-950/85 border border-amber-500/20 rounded-xl p-3 text-xs text-stone-100 font-semibold focus:outline-none focus:ring-1 focus:ring-amber-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-stone-300 uppercase mb-1">
                          Thông tin Bản quyền & Copyright *
                        </label>
                        <textarea
                          value={localCopyright}
                          onChange={(e) => setLocalCopyright(e.target.value)}
                          placeholder="Thông tin từ chối liên kết, bản quyền..."
                          rows={2}
                          className="w-full bg-red-950/85 border border-amber-500/20 rounded-xl p-3 text-xs text-stone-100 font-semibold focus:outline-none focus:ring-1 focus:ring-amber-500"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-black py-2.5 px-6 rounded-xl text-xs uppercase tracking-wider transition duration-150 transform active:scale-95 cursor-pointer shadow-lg"
                  >
                    Lưu thông tin Home & Footer
                  </button>
                </form>
              )}

              {contentSubTab === "recharge" && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    onUpdateBilling({
                      atmBank: localAtmBank,
                      atmAccountNumber: localAtmNumber,
                      atmAccountOwner: localAtmOwner,
                      momoPhone: localMomoPhone,
                      momoAccountOwner: localMomoOwner,
                    });
                    addToast("Cập nhật thông tin nạp Momo & ATM thành công!", "success");
                  }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Momo Configuration Card */}
                    <div className="bg-[#2c0404]/80 p-5 rounded-2xl border border-amber-500/10 space-y-4">
                      <div className="border-b border-rose-900/40 pb-2 flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                        <h5 className="font-extrabold text-xs uppercase text-amber-300 tracking-wider">
                          Cấu hình ví điện tử MOMO
                        </h5>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-[11px] font-bold text-stone-300 uppercase mb-1">
                            Số điện thoại ví Momo *
                          </label>
                          <input
                            type="text"
                            value={localMomoPhone}
                            onChange={(e) => setLocalMomoPhone(e.target.value)}
                            className="w-full bg-red-950/80 border border-amber-500/20 rounded-xl py-2 px-3 text-xs sm:text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono font-bold"
                            placeholder="Ví dụ: 0399881122"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-stone-300 uppercase mb-1">
                            Tên chủ ví (In hoa không dấu) *
                          </label>
                          <input
                            type="text"
                            value={localMomoOwner}
                            onChange={(e) => setLocalMomoOwner(e.target.value)}
                            className="w-full bg-red-950/80 border border-amber-500/20 rounded-xl py-2 px-3 text-xs sm:text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:ring-1 focus:ring-amber-500 font-bold"
                            placeholder="Ví dụ: DOAN KHAC Y"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {/* ATM banking Configuration Card */}
                    <div className="bg-[#2c0404]/80 p-5 rounded-2xl border border-amber-500/10 space-y-4">
                      <div className="border-b border-rose-900/40 pb-2 flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                        <h5 className="font-extrabold text-xs uppercase text-amber-300 tracking-wider">
                          Cấu hình chuyển khoản Ngân hàng (ATM)
                        </h5>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-[11px] font-bold text-stone-300 uppercase mb-1">
                            Tên ngân hàng (Ký hiệu VietQR) *
                          </label>
                          <input
                            type="text"
                            value={localAtmBank}
                            onChange={(e) => setLocalAtmBank(e.target.value)}
                            className="w-full bg-red-950/80 border border-amber-500/20 rounded-xl py-2 px-3 text-xs sm:text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:ring-1 focus:ring-amber-500 font-bold"
                            placeholder="Ví dụ: ACB, MB, VCB..."
                            required
                          />
                          <p className="text-[9px] text-stone-400 mt-0.5">
                            * Vui lòng điền đúng mã định danh ngân hàng (ví dụ: ACB, MB, TCB, VCB) để QR code ngân hàng hoạt động đúng.
                          </p>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-stone-300 uppercase mb-1">
                            Số tài khoản nhận tiền *
                          </label>
                          <input
                            type="text"
                            value={localAtmNumber}
                            onChange={(e) => setLocalAtmNumber(e.target.value)}
                            className="w-full bg-red-950/80 border border-amber-500/20 rounded-xl py-2 px-3 text-xs sm:text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono font-bold"
                            placeholder="Ví dụ: 17506391"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-stone-300 uppercase mb-1">
                            Tên người nhận (In hoa không dấu) *
                          </label>
                          <input
                            type="text"
                            value={localAtmOwner}
                            onChange={(e) => setLocalAtmOwner(e.target.value)}
                            className="w-full bg-red-950/80 border border-amber-500/20 rounded-xl py-2 px-3 text-xs sm:text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:ring-1 focus:ring-amber-500 font-bold"
                            placeholder="Ví dụ: DOAN KHAC Y"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black py-2.5 px-6 rounded-xl text-xs uppercase tracking-wider transition duration-150 transform active:scale-95 cursor-pointer shadow-lg"
                  >
                    Lưu cấu hình chuyển khoản
                  </button>
                </form>
              )}
            </div>
          )}

          {/* TAB 4: CATEGORY CRUD MANAGEMENT */}
          {activeTab === "categories" && (
            <div className="bg-[#4d0808] p-5 sm:p-6 rounded-3xl border border-amber-500/20 shadow-xl space-y-6 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-amber-500/15">
                <h4 className="font-extrabold uppercase text-sm text-stone-100 flex items-center gap-1.5">
                  <Settings className="w-4 h-4 text-amber-400" />
                  Quản lý Danh Mục Sản Phẩm
                </h4>
              </div>

              {/* Add category form */}
              <form onSubmit={handleAddCategorySubmit} className="bg-red-950/40 p-4 rounded-2xl border border-amber-500/10 space-y-3">
                <span className="text-[10px] text-stone-400 uppercase font-black tracking-widest block">
                  Thêm danh mục mới
                </span>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    placeholder="Nhập tên danh mục (ví dụ: DANH MỤC ACC VIP...)"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="grow bg-red-950 border border-amber-500/20 rounded-xl py-2.5 px-3 text-xs sm:text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:ring-1 focus:ring-amber-500 font-bold"
                  />
                  <button
                    type="submit"
                    className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-black py-2 px-5 rounded-xl text-xs uppercase tracking-wider transition shrink-0 cursor-pointer"
                  >
                    Thêm
                  </button>
                </div>
              </form>

              {/* Categories list */}
              <div className="bg-[#2c0404]/80 p-4 rounded-2xl border border-amber-500/10">
                <span className="text-[10px] text-stone-400 uppercase font-black tracking-widest block mb-3">
                  Danh sách danh mục đang có
                </span>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-amber-500/20 text-[10px] text-stone-400 uppercase font-black">
                        <th className="py-2.5 px-3">Tên danh mục</th>
                        <th className="py-2.5 px-3 text-center">Tồn kho Acc</th>
                        <th className="py-2.5 px-3 text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categories.map((cat) => {
                        const count = accounts.filter((a) => a.category === cat).length;
                        const isEditing = editingCategoryOldName === cat;

                        return (
                          <tr key={cat} className="border-b border-amber-500/5 hover:bg-red-950/20 transition">
                            <td className="py-3 px-3 font-extrabold text-stone-100">
                              {isEditing ? (
                                <form onSubmit={handleEditCategorySubmit} className="flex gap-2 w-full max-w-sm">
                                  <input
                                    type="text"
                                    value={editingCategoryNewName}
                                    onChange={(e) => setEditingCategoryNewName(e.target.value)}
                                    className="grow bg-red-950 border border-amber-500/30 rounded-lg py-1 px-2 text-xs text-stone-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                                    autoFocus
                                  />
                                  <button
                                    type="submit"
                                    className="bg-emerald-500 hover:bg-emerald-400 text-stone-950 px-2 py-1 rounded text-[10px] font-black uppercase"
                                  >
                                    Lưu
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setEditingCategoryOldName(null)}
                                    className="bg-stone-800 hover:bg-stone-700 text-stone-300 px-2 py-1 rounded text-[10px] font-black uppercase"
                                  >
                                    Hủy
                                  </button>
                                </form>
                              ) : (
                                <span>{cat}</span>
                              )}
                            </td>
                            <td className="py-3 px-3 text-center font-mono font-bold text-amber-400">
                              {count} nick
                            </td>
                            <td className="py-3 px-3 text-right space-x-2">
                              {!isEditing && (
                                <>
                                  <button
                                    onClick={() => startEditCategory(cat)}
                                    className="py-1 px-2.5 bg-stone-900/50 hover:bg-emerald-500 hover:text-stone-950 text-emerald-400 rounded-lg border border-amber-500/20 text-[10px] font-bold uppercase transition inline-block cursor-pointer"
                                  >
                                    Sửa
                                  </button>
                                  <button
                                    onClick={() => setDeleteCategoryConfirm(cat)}
                                    className="py-1 px-2.5 bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-400 rounded-lg text-[10px] font-bold uppercase transition inline-block cursor-pointer"
                                  >
                                    Xóa
                                  </button>
                                </>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL 1: ADD NEW GAME ACCOUNT */}
      {showAddForm && (
        <div
          onClick={() => setShowAddForm(false)}
          className="fixed inset-0 bg-black/85 flex items-center justify-center p-4 z-50 overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#4d0808] border-2 border-amber-500/40 rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl relative my-8 animate-in fade-in zoom-in duration-200"
          >
            <button
              onClick={() => setShowAddForm(false)}
              className="absolute top-4 right-4 text-stone-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-1.5 border-b border-amber-500/20 pb-2">
              <Plus className="w-5 h-5 text-amber-300" />
              <h4 className="font-extrabold uppercase text-sm text-stone-100">
                Đăng bán tài khoản mới
              </h4>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-5 text-xs sm:text-sm max-h-[75vh] overflow-y-auto pr-1">
              {/* Cate (dropdown of BE options) */}
              <div>
                <label className="block text-amber-300 font-bold mb-1.5 uppercase tracking-wide">Danh Mục Bán</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-red-950 border border-amber-500/20 rounded-xl py-2.5 px-3 focus:outline-none focus:ring-1 focus:ring-amber-500 text-stone-100 font-bold"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Product name (text) */}
              <div>
                <label className="block text-amber-300 font-bold mb-1.5 uppercase tracking-wide">Tên sản phẩm (Tiêu đề)</label>
                <input
                  type="text"
                  placeholder="Ví dụ: ACC SIÊU NGON 50K CRYSTALS..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-red-950 border border-amber-500/20 rounded-xl py-2.5 px-3 focus:outline-none focus:ring-1 focus:ring-amber-500 text-stone-100 font-bold"
                  required
                />
              </div>

              {/* File account (file.txt + download template button) */}
              <div className="bg-red-950/40 p-4 rounded-2xl border border-amber-500/10 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-amber-300 font-bold uppercase tracking-wide">File tài khoản (.txt)</label>
                  <button
                    type="button"
                    onClick={handleDownloadTemplate}
                    className="text-[10px] text-amber-400 hover:text-amber-300 underline font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    📥 Tải File Mẫu (.txt)
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <label className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-amber-500/30 hover:border-amber-500/60 bg-red-950/60 rounded-xl py-4 px-3 cursor-pointer transition">
                    <span className="text-stone-300 text-xs font-bold text-center">
                      {accountFileName ? `📄 ${accountFileName}` : "📁 Chọn file tài khoản (.txt)"}
                    </span>
                    <span className="text-[10px] text-stone-500 mt-1">
                      {accountFileContent ? `Đã đọc ${accountFileContent.split('\n').filter(line => line.trim().length > 0 && !line.startsWith("#")).length} dòng` : "Hệ thống sẽ tự động đếm số lượng tài khoản từ số dòng"}
                    </span>
                    <input
                      type="file"
                      accept=".txt"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setAccountFileName(file.name);
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            if (event.target?.result) {
                              setAccountFileContent(event.target.result as string);
                              addToast(`Đã tải file tài khoản thành công!`, "success");
                            }
                          };
                          reader.readAsText(file);
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Product media (URL or upload) */}
              <div>
                <label className="block text-amber-300 font-bold mb-1.5 uppercase tracking-wide">Ảnh / Video / GIF sản phẩm (URL hoặc tải file lên)</label>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                  <div className="sm:col-span-8 space-y-2">
                    <input
                      type="text"
                      placeholder="Dán đường dẫn ảnh/video/gif (URL) hoặc tải file lên..."
                      value={imageUrl}
                      onChange={(e) => {
                        setImageUrl(e.target.value);
                        setPendingImageFile(null); // dán URL tay -> bỏ file ảnh đang chờ upload
                      }}
                      className="w-full bg-red-950 border border-amber-500/20 rounded-xl py-2 px-3 focus:outline-none focus:ring-1 focus:ring-amber-500 text-stone-100 text-xs font-semibold"
                    />
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-stone-400">Hoặc</span>
                      <input
                        type="file"
                        accept="image/*,video/*"
                        disabled={uploadingImage}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          e.target.value = ""; // cho phép chọn lại cùng file
                          if (!file) return;

                          // Video: backend chưa hỗ trợ upload -> giữ fallback nhúng base64.
                          if (!isUploadableImage(file)) {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              if (event.target?.result) setImageUrl(event.target.result as string);
                            };
                            reader.readAsDataURL(file);
                            return;
                          }

                          // Ảnh: KHOAN gọi presign/upload. Chỉ giữ file + preview tại chỗ,
                          // upload lên BizFly Cloud khi bấm nút "Đăng bán".
                          setPendingImageFile(file);
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            if (event.target?.result) setImageUrl(event.target.result as string);
                          };
                          reader.readAsDataURL(file);
                        }}
                        className="text-xs text-stone-300 file:bg-stone-900 file:text-amber-400 file:border file:border-amber-500/20 file:py-1 file:px-3 file:rounded-xl file:mr-2 file:cursor-pointer hover:file:bg-amber-500 hover:file:text-stone-950 file:transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                      {uploadingImage && <span className="text-[10px] text-amber-400 animate-pulse">Đang tải ảnh lên...</span>}
                    </div>
                  </div>
                  <div className="sm:col-span-4 flex justify-center">
                    <div className="w-24 h-24 rounded-2xl overflow-hidden border border-amber-500/20 bg-stone-900 flex items-center justify-center relative shadow-inner">
                      {imageUrl ? (
                        imageUrl.startsWith("data:video/") || imageUrl.includes(".mp4") ? (
                          <video src={imageUrl} className="w-full h-full object-cover" muted autoPlay loop />
                        ) : (
                          <img src={imageUrl} className="w-full h-full object-cover" alt="Preview" />
                        )
                      ) : (
                        <span className="text-[9px] text-stone-500 text-center px-2">Chưa có ảnh/video</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Price inputs: Giá gốc & % Giảm */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-amber-300 font-bold mb-1.5 uppercase tracking-wide">Giá gốc thị trường (đ)</label>
                  <input
                    type="text"
                    value={displayOriginalPrice}
                    onChange={(e) => handleOriginalPriceChange(e.target.value)}
                    className="w-full bg-red-950 border border-amber-500/20 rounded-xl py-2.5 px-3 focus:outline-none focus:ring-1 focus:ring-amber-500 text-stone-100 font-mono font-black"
                    placeholder="Ví dụ: 150.000"
                    required
                  />
                </div>
                <div>
                  <label className="block text-amber-300 font-bold mb-1.5 uppercase tracking-wide">Phần trăm giảm (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={discount}
                    onChange={(e) => setDiscount(Math.min(100, Math.max(0, Number(e.target.value))))}
                    className="w-full bg-red-950 border border-amber-500/20 rounded-xl py-2.5 px-3 focus:outline-none focus:ring-1 focus:ring-amber-500 text-stone-100 font-black"
                    placeholder="Ví dụ: 10"
                    required
                  />
                </div>
              </div>

              {/* Calculated actual selling price box */}
              <div className="bg-amber-500/10 border border-amber-500/35 rounded-2xl p-3.5">
                <span className="text-[10px] text-stone-400 uppercase font-black block">Giá bán thực tế (đã giảm)</span>
                <span className="text-lg font-mono font-black text-amber-300">
                  {Math.round(originalPrice * (1 - discount / 100)).toLocaleString("vi-VN")} đ
                </span>
              </div>

              {/* Thông số hiển thị ở trang chi tiết */}
              <div className="bg-red-950/40 p-4 rounded-2xl border border-amber-500/10 space-y-4">
                <span className="text-[10px] bg-amber-500/20 text-amber-300 py-0.5 px-2 rounded font-black uppercase inline-block">Thông số hiển thị</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-amber-300 font-bold mb-1.5 uppercase tracking-wide">Máy Chủ / Thiết bị</label>
                    <input
                      type="text"
                      value={server}
                      onChange={(e) => setServer(e.target.value)}
                      placeholder="Ví dụ: Asia / Global (Android & iOS)"
                      className="w-full bg-red-950 border border-amber-500/20 rounded-xl py-2.5 px-3 focus:outline-none focus:ring-1 focus:ring-amber-500 text-stone-100 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-amber-300 font-bold mb-1.5 uppercase tracking-wide">Chrono Crystals (CC)</label>
                    <input
                      type="number"
                      min="0"
                      value={chronoCrystals}
                      onChange={(e) => setChronoCrystals(Math.max(0, Number(e.target.value)))}
                      placeholder="Ví dụ: 25000"
                      className="w-full bg-red-950 border border-amber-500/20 rounded-xl py-2.5 px-3 focus:outline-none focus:ring-1 focus:ring-amber-500 text-stone-100 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-amber-300 font-bold mb-1.5 uppercase tracking-wide">Tài Nguyên (PL)</label>
                    <input
                      type="number"
                      min="0"
                      value={powerLevel}
                      onChange={(e) => setPowerLevel(Math.max(0, Number(e.target.value)))}
                      placeholder="Ví dụ: 100"
                      className="w-full bg-red-950 border border-amber-500/20 rounded-xl py-2.5 px-3 focus:outline-none focus:ring-1 focus:ring-amber-500 text-stone-100 font-bold"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-amber-300 font-bold mb-1.5 uppercase tracking-wide">Độ nổi tiếng (Sao) — nhập nhiều dòng</label>
                    <textarea
                      value={stars}
                      onChange={(e) => setStars(e.target.value)}
                      rows={3}
                      placeholder={"★ 8 Sao VIP\nHạng PvP: Cao thủ\nSự kiện: Top 100"}
                      className="w-full bg-red-950 border border-amber-500/20 rounded-xl py-2.5 px-3 focus:outline-none focus:ring-1 focus:ring-amber-500 text-stone-100 font-semibold"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-linear-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-red-950 font-black py-3 px-4 rounded-xl text-xs uppercase tracking-wide transition duration-150 transform active:scale-[0.98] cursor-pointer shadow-lg shadow-amber-500/15"
              >
                Lên Sàn Đăng Bán Ngay
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT GAME ACCOUNT */}
      {editingAcc && (
        <div
          onClick={() => setEditingAcc(null)}
          className="fixed inset-0 bg-black/85 flex items-center justify-center p-4 z-50 overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#4d0808] border-2 border-amber-500/40 rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl relative my-8 animate-in fade-in zoom-in duration-200"
          >
            <button
              onClick={() => setEditingAcc(null)}
              className="absolute top-4 right-4 text-stone-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-1.5 border-b border-amber-500/20 pb-2">
              <svg className="w-5 h-5 text-amber-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
              <h4 className="font-extrabold uppercase text-sm text-stone-100">
                Chỉnh sửa tài khoản {editId}
              </h4>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs sm:text-sm max-h-[75vh] overflow-y-auto pr-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-stone-300 font-bold mb-1">Mã Số ACC (Không thể đổi)</label>
                  <input
                    type="text"
                    value={editId}
                    disabled
                    className="w-full bg-red-950/40 border border-amber-500/10 rounded-xl py-2 px-3 text-stone-500 font-black cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-stone-300 font-bold mb-1">Danh Mục Bán</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full bg-red-950 border border-amber-500/15 rounded-xl py-2.5 px-3 focus:outline-none text-amber-300 font-bold"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-stone-300 font-bold mb-1">Ảnh sản phẩm (URL hoặc tải file lên)</label>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                  <div className="sm:col-span-8 space-y-2">
                    <input
                      type="text"
                      placeholder="Dán đường dẫn ảnh (URL) hoặc tải ảnh lên bên dưới..."
                      value={editImageUrl}
                      onChange={(e) => {
                        setEditImageUrl(e.target.value);
                        setPendingEditImageFile(null); // dán URL tay -> bỏ file ảnh đang chờ upload
                      }}
                      className="w-full bg-red-950 border border-amber-500/15 rounded-xl py-2 px-3 focus:outline-none text-stone-100 text-xs"
                    />
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-stone-400">Hoặc</span>
                      <input
                        type="file"
                        accept="image/*"
                        disabled={uploadingEditImage}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          e.target.value = ""; // cho phép chọn lại cùng file
                          if (!file) return;

                          // Video: backend chưa hỗ trợ upload -> giữ fallback nhúng base64.
                          if (!isUploadableImage(file)) {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              if (event.target?.result) {
                                setEditImageUrl(event.target.result as string);
                                setPendingEditImageFile(null);
                              }
                            };
                            reader.readAsDataURL(file);
                            return;
                          }

                          // Ảnh: KHOAN gọi presign/upload. Chỉ giữ file + preview tại chỗ,
                          // upload lên BizFly Cloud khi bấm nút "Cập nhật".
                          setPendingEditImageFile(file);
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            if (event.target?.result) setEditImageUrl(event.target.result as string);
                          };
                          reader.readAsDataURL(file);
                        }}
                        className="text-xs text-stone-300 file:bg-stone-900 file:text-amber-400 file:border file:border-amber-500/20 file:py-1 file:px-3 file:rounded-xl file:mr-2 file:cursor-pointer hover:file:bg-amber-500 hover:file:text-stone-950 file:transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                      {uploadingEditImage && <span className="text-[10px] text-amber-400 animate-pulse">Đang tải ảnh lên...</span>}
                    </div>
                  </div>
                  <div className="sm:col-span-4 flex justify-center">
                    <div className="w-20 h-20 rounded-2xl overflow-hidden border border-amber-500/20 bg-stone-900 flex items-center justify-center relative">
                      {editImageUrl ? (
                        <img src={editImageUrl} className="w-full h-full object-cover" alt="Preview" />
                      ) : (
                        <span className="text-[9px] text-stone-500 text-center px-2">Chưa có ảnh</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-stone-300 font-bold mb-1">Tiêu Đề Quảng Cáo (Bắt buộc)</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full bg-red-950 border border-amber-500/15 rounded-xl py-2 px-3 focus:outline-none text-stone-100 font-extrabold"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-amber-300 font-bold mb-1.5 uppercase tracking-wide">Giá gốc thị trường (đ)</label>
                  <input
                    type="text"
                    value={displayEditOriginalPrice}
                    onChange={(e) => handleEditOriginalPriceChange(e.target.value)}
                    className="w-full bg-red-950 border border-amber-500/20 rounded-xl py-2.5 px-3 focus:outline-none focus:ring-1 focus:ring-amber-500 text-stone-100 font-mono font-black"
                    placeholder="Ví dụ: 150.000"
                    required
                  />
                </div>
                <div>
                  <label className="block text-amber-300 font-bold mb-1.5 uppercase tracking-wide">Phần trăm giảm (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={editDiscount}
                    onChange={(e) => setEditDiscount(Math.min(100, Math.max(0, Number(e.target.value))))}
                    className="w-full bg-red-950 border border-amber-500/20 rounded-xl py-2.5 px-3 focus:outline-none focus:ring-1 focus:ring-amber-500 text-stone-100 font-black"
                    placeholder="Ví dụ: 10"
                    required
                  />
                </div>
              </div>

              {/* Calculated actual selling price box */}
              <div className="bg-amber-500/10 border border-amber-500/35 rounded-2xl p-3.5">
                <span className="text-[10px] text-stone-400 uppercase font-black block">Giá bán thực tế (đã giảm)</span>
                <span className="text-lg font-mono font-black text-amber-300">
                  {Math.round(editOriginalPrice * (1 - editDiscount / 100)).toLocaleString("vi-VN")} đ
                </span>
              </div>

              <div className="bg-red-950/80 p-4 rounded-2xl border border-rose-500/20 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] bg-rose-600 text-stone-100 py-0.5 px-2 rounded font-black uppercase">
                    Danh sách tài khoản trong kho (Credential Stock)
                  </span>
                  <label
                    title="Lưu ý: Tải lên file mới sẽ ghi đè toàn bộ danh sách tài khoản chưa bán trong kho!"
                    className="text-[10px] text-amber-400 hover:text-amber-300 underline font-bold cursor-pointer transition"
                  >
                    📁 Up file .txt mới
                    <input
                      type="file"
                      accept=".txt"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setEditAccountFileName(file.name);
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            if (event.target?.result) {
                              setEditAccountFileContent(event.target.result as string);
                              addToast(`Đã tải file tài khoản mới thành công!`, "success");
                            }
                          };
                          reader.readAsText(file);
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                </div>

                {loadingItems ? (
                  <div className="text-center py-4 text-stone-500 text-xs">
                    Đang tải danh sách tài khoản...
                  </div>
                ) : (
                  <div>
                    <textarea
                      value={editAccountFileContent}
                      onChange={(e) => setEditAccountFileContent(e.target.value)}
                      placeholder="Tài khoản | Mật khẩu | Mã chuyển code (mỗi tài khoản một dòng)..."
                      className="w-full bg-black/40 border border-amber-500/10 rounded-lg py-2 px-3 text-xs text-amber-300 font-mono h-32 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                    <p className="text-[10px] text-stone-400 mt-1 italic">
                      * Định dạng: <strong>TaiKhoan|MatKhau</strong> hoặc <strong>TaiKhoan|MatKhau|MaChuyenCode</strong>. Chỉ chỉnh sửa các tài khoản chưa bán.
                    </p>
                  </div>
                )}
              </div>

              {/* Thông số hiển thị ở trang chi tiết */}
              <div className="bg-red-950/60 p-4 rounded-2xl border border-amber-500/10 space-y-4">
                <span className="text-[10px] bg-amber-500/20 text-amber-300 py-0.5 px-2 rounded font-black uppercase inline-block">Thông số hiển thị</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-stone-300 font-bold mb-1">Máy Chủ / Thiết bị</label>
                    <input
                      type="text"
                      value={editServer}
                      onChange={(e) => setEditServer(e.target.value)}
                      placeholder="Ví dụ: Asia / Global (Android & iOS)"
                      className="w-full bg-red-950 border border-amber-500/15 rounded-xl py-2 px-3 focus:outline-none text-stone-100 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-300 font-bold mb-1">Chrono Crystals (CC)</label>
                    <input
                      type="number"
                      min="0"
                      value={editChronoCrystals}
                      onChange={(e) => setEditChronoCrystals(Math.max(0, Number(e.target.value)))}
                      className="w-full bg-red-950 border border-amber-500/15 rounded-xl py-2 px-3 focus:outline-none text-stone-100 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-300 font-bold mb-1">Tài Nguyên (PL)</label>
                    <input
                      type="number"
                      min="0"
                      value={editPowerLevel}
                      onChange={(e) => setEditPowerLevel(Math.max(0, Number(e.target.value)))}
                      className="w-full bg-red-950 border border-amber-500/15 rounded-xl py-2 px-3 focus:outline-none text-stone-100 font-bold"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-stone-300 font-bold mb-1">Độ nổi tiếng (Sao) — nhập nhiều dòng</label>
                    <textarea
                      value={editStars}
                      onChange={(e) => setEditStars(e.target.value)}
                      rows={3}
                      placeholder={"★ 8 Sao VIP\nHạng PvP: Cao thủ\nSự kiện: Top 100"}
                      className="w-full bg-red-950 border border-amber-500/15 rounded-xl py-2 px-3 focus:outline-none text-stone-100 font-semibold"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={uploadingEditImage}
                className="w-full bg-amber-500 hover:bg-amber-400 text-stone-950 font-black py-2.5 px-4 rounded-xl text-xs uppercase transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploadingEditImage ? "Đang tải ảnh lên..." : "Lưu thay đổi"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: TRANSACTION DETAIL POPUP */}
      {selectedTx && (
        <div
          onClick={() => setSelectedTx(null)}
          className="fixed inset-0 bg-black/85 flex items-center justify-center p-4 z-50"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#4d0808] border-2 border-amber-500/40 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl relative"
          >
            <button
              onClick={() => setSelectedTx(null)}
              className="absolute top-4 right-4 text-stone-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-1.5 border-b border-amber-500/20 pb-2">
              <Info className="w-5 h-5 text-amber-300" />
              <h4 className="font-extrabold uppercase text-sm text-stone-100">Chi tiết giao dịch</h4>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-amber-500/5">
                <span className="text-stone-400">Mã giao dịch:</span>
                <span className="font-mono font-black text-rose-300">{selectedTx.id}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-amber-500/5">
                <span className="text-stone-400">Loại:</span>
                <span className="font-black text-amber-300 uppercase">{selectedTx.type}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-amber-500/5">
                <span className="text-stone-400">Người thực hiện:</span>
                <span className="font-bold text-stone-200">{selectedTx.username}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-amber-500/5">
                <span className="text-stone-400">Số tiền biến động:</span>
                <span className="font-black text-stone-100">
                  {isCreditTx(selectedTx.type) ? (
                    <span className="text-emerald-400">+{selectedTx.amount.toLocaleString()}đ</span>
                  ) : (
                    <span className="text-rose-400">-{selectedTx.amount.toLocaleString()}đ</span>
                  )}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-amber-500/5">
                <span className="text-stone-400">Nội dung / Mô tả:</span>
                <span className="font-semibold text-stone-200 text-right max-w-[65%]">{selectedTx.description}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-amber-500/5">
                <span className="text-stone-400">Trạng thái:</span>
                <span className="font-black text-emerald-400">Thành công</span>
              </div>
              <div className="flex justify-between py-1 border-b border-amber-500/5">
                <span className="text-stone-400">Mốc thời gian:</span>
                <span className="font-mono text-stone-300">{selectedTx.time}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: GAME ACCOUNT DETAIL POPUP */}
      {selectedAcc && (
        <div
          onClick={() => setSelectedAcc(null)}
          className="fixed inset-0 bg-black/85 flex items-center justify-center p-4 z-50 overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#4d0808] border-2 border-amber-500/40 rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl relative my-8 animate-in fade-in zoom-in duration-200"
          >
            <button
              onClick={() => setSelectedAcc(null)}
              className="absolute top-4 right-4 text-stone-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-1.5 border-b border-amber-500/20 pb-2">
              <Info className="w-5 h-5 text-amber-300" />
              <h4 className="font-extrabold uppercase text-sm text-stone-100">Chi tiết sản phẩm</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              {/* Left Column: Media & Details */}
              <div className="space-y-4">
                {selectedAcc.imageUrl && (
                  <div className="w-full h-44 rounded-2xl overflow-hidden border border-amber-500/20 bg-stone-900 flex items-center justify-center relative">
                    {selectedAcc.imageUrl.startsWith("data:video/") || selectedAcc.imageUrl.includes(".mp4") ? (
                      <video src={selectedAcc.imageUrl} className="w-full h-full object-cover" muted autoPlay loop />
                    ) : (
                      <img src={selectedAcc.imageUrl} className="w-full h-full object-cover" alt={selectedAcc.title} />
                    )}
                  </div>
                )}

                <div className="space-y-3 text-xs bg-black/20 p-4 rounded-2xl border border-amber-500/5">
                  <div className="flex justify-between py-1 border-b border-amber-500/5">
                    <span className="text-stone-400">Mã Số ACC:</span>
                    <span className="font-mono font-black text-amber-400">{selectedAcc.id}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-amber-500/5">
                    <span className="text-stone-400">Danh Mục:</span>
                    <span className="font-bold text-stone-200">{selectedAcc.category}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-amber-500/5">
                    <span className="text-stone-400">Tiêu đề:</span>
                    <span className="font-semibold text-stone-200 text-right max-w-[65%]">{selectedAcc.title}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-amber-500/5">
                    <span className="text-stone-400">Giá gốc:</span>
                    <span className="font-semibold text-stone-400 line-through">{selectedAcc.originalPrice.toLocaleString()}đ</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-amber-500/5">
                    <span className="text-stone-400">Giá bán:</span>
                    <span className="font-black text-rose-300">{selectedAcc.price.toLocaleString()}đ</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-amber-500/5">
                    <span className="text-stone-400">Giảm giá:</span>
                    <span className="font-black text-emerald-400">
                      {selectedAcc.originalPrice > 0
                        ? Math.round((1 - selectedAcc.price / selectedAcc.originalPrice) * 100)
                        : 0}%
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-amber-500/5">
                    <span className="text-stone-400">Máy chủ / Thiết bị:</span>
                    <span className="font-bold text-amber-200 text-right max-w-[65%]">{selectedAcc.stats?.server || "-"}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-amber-500/5">
                    <span className="text-stone-400">Chrono Crystals:</span>
                    <span className="font-bold text-emerald-400">{(selectedAcc.stats?.chronoCrystals ?? 0).toLocaleString()} CC</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-amber-500/5">
                    <span className="text-stone-400">Tài Nguyên:</span>
                    <span className="font-bold text-sky-300">PL {selectedAcc.stats?.powerLevel ?? 0}</span>
                  </div>
                  <div className="py-1">
                    <span className="text-stone-400 block mb-1">Độ nổi tiếng (Sao):</span>
                    <span className="font-bold text-rose-300 whitespace-pre-line block">{selectedAcc.stats?.starsCount || "-"}</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Credentials Stock List */}
              <div className="bg-[#2c0404]/85 p-4 rounded-3xl border border-amber-500/15 space-y-3">
                <span className="text-[10px] text-amber-300 uppercase font-black tracking-widest block border-b border-amber-500/10 pb-1.5">
                  Danh sách tài khoản trong kho ({accountItems.length})
                </span>

                {loadingItems ? (
                  <div className="text-center py-6 text-stone-500 text-xs">
                    Đang tải danh sách tài khoản...
                  </div>
                ) : accountItems.length === 0 ? (
                  <div className="text-center py-6 text-stone-500 text-xs italic">
                    Chưa có tài khoản nào trong kho.
                  </div>
                ) : (
                  <div className="max-h-[320px] overflow-y-auto space-y-2 pr-1">
                    {accountItems.map((item, idx) => (
                      <div key={item.itemId || idx} className="bg-black/40 p-2.5 rounded-xl border border-amber-500/5 space-y-1 relative text-[11px]">
                        <div className="flex justify-between items-center">
                          <span className="text-stone-400 font-mono font-bold">#{idx + 1}</span>
                          <span className={`py-0.5 px-2 rounded-full text-[9px] font-black uppercase ${item.isSold
                            ? "bg-stone-800 text-stone-400 border border-stone-700"
                            : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            }`}>
                            {item.isSold ? "Đã bán" : "Còn hàng"}
                          </span>
                        </div>
                        <div>
                          <span className="text-stone-500">Tài khoản:</span> <code className="text-amber-300 font-bold select-all bg-black/40 px-1 rounded">{item.username}</code>
                        </div>
                        {item.password && (
                          <div>
                            <span className="text-stone-500">Mật khẩu:</span> <code className="text-amber-300 font-bold select-all bg-black/40 px-1 rounded">{item.password}</code>
                          </div>
                        )}
                        {item.transferCode && (
                          <div>
                            <span className="text-stone-500">Mã chuyển:</span> <code className="text-emerald-300 font-bold select-all bg-black/40 px-1 rounded">{item.transferCode}</code>
                          </div>
                        )}
                        {item.soldAt && (
                          <div className="text-[9px] text-stone-500 italic">
                            Bán lúc: {new Date(item.soldAt).toLocaleString("vi-VN")}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Modal: Tặng tiền cho user */}
      {giftModalOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => !giftSubmitting && setGiftModalOpen(false)}
        >
          <div
            className="w-full max-w-md bg-[#2c0404] rounded-3xl border border-amber-500/20 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-amber-500/15 bg-[#4d0808]">
              <h3 className="font-extrabold uppercase text-sm text-amber-300 flex items-center gap-2">
                <Gift className="w-4 h-4" /> Tặng tiền cho người dùng
              </h3>
              <button
                onClick={() => !giftSubmitting && setGiftModalOpen(false)}
                className="text-stone-400 hover:text-amber-400 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Chọn user */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-stone-400">
                  Chọn người dùng
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={giftUserSearch}
                    onChange={(e) => setGiftUserSearch(e.target.value)}
                    placeholder="Tìm theo email / tên / SĐT..."
                    className="w-full bg-[#1a0202] border border-amber-500/15 rounded-xl pl-9 pr-3 py-2 text-xs text-stone-100 placeholder:text-stone-600 focus:outline-none focus:border-amber-500/40"
                  />
                </div>

                <div className="max-h-44 overflow-y-auto rounded-xl border border-amber-500/10 divide-y divide-amber-500/5">
                  {usersQuery.isLoading ? (
                    <div className="text-center text-stone-500 text-xs py-4">Đang tải...</div>
                  ) : giftUsers.length === 0 ? (
                    <div className="text-center text-stone-500 text-xs py-4">Không tìm thấy người dùng nào.</div>
                  ) : (
                    giftUsers.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => setGiftSelectedUser(u)}
                        className={`w-full text-left px-3 py-2 transition flex items-center justify-between gap-2 ${giftSelectedUser?.id === u.id
                            ? "bg-emerald-700/30"
                            : "hover:bg-stone-900/60"
                          }`}
                      >
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-stone-100 truncate">{u.email}</div>
                          <div className="text-[10px] text-stone-500 truncate">
                            {u.name}{u.phoneNumber ? ` · ${u.phoneNumber}` : ""}
                          </div>
                        </div>
                        <span className="text-[10px] font-mono font-bold text-amber-400 shrink-0">
                          {u.balance.toLocaleString()}đ
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Số tiền */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-stone-400">
                  Số tiền tặng (VND)
                </label>
                <div className="relative">
                  <Wallet className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    min={0}
                    value={giftAmount}
                    onChange={(e) => setGiftAmount(e.target.value)}
                    placeholder="Nhập số tiền..."
                    className="w-full bg-[#1a0202] border border-amber-500/15 rounded-xl pl-9 pr-3 py-2 text-sm font-mono text-emerald-300 placeholder:text-stone-600 focus:outline-none focus:border-amber-500/40"
                  />
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {[10000, 50000, 100000, 200000, 500000].map((v) => (
                    <button
                      key={v}
                      onClick={() => setGiftAmount(String(v))}
                      className="px-2 py-1 rounded-lg bg-stone-900/60 hover:bg-amber-500/20 text-[10px] font-bold text-stone-300 border border-amber-500/10 transition"
                    >
                      +{v.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              {giftSelectedUser && Number(giftAmount) > 0 && (
                <div className="text-[11px] text-stone-300 bg-[#1a0202] rounded-xl px-3 py-2 border border-amber-500/10">
                  Tặng <span className="font-bold text-emerald-400">{Number(giftAmount).toLocaleString()}đ</span> cho{" "}
                  <span className="font-bold text-amber-300">{giftSelectedUser.email}</span>. Số dư mới:{" "}
                  <span className="font-bold text-emerald-400">
                    {(giftSelectedUser.balance + Number(giftAmount)).toLocaleString()}đ
                  </span>
                </div>
              )}
            </div>

            <div className="flex gap-2 px-5 py-4 border-t border-amber-500/15">
              <button
                onClick={() => setGiftModalOpen(false)}
                disabled={giftSubmitting}
                className="flex-1 bg-stone-800 hover:bg-stone-700 disabled:opacity-50 text-stone-200 py-2 rounded-xl font-bold text-xs transition"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleGiftSubmit}
                disabled={giftSubmitting || !giftSelectedUser || !(Number(giftAmount) > 0)}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5"
              >
                <Gift className="w-3.5 h-3.5" />
                {giftSubmitting ? "Đang tặng..." : "Xác nhận tặng"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Dialog for Deleting Account */}
      <ConfirmDialog
        isOpen={deleteConfirmId !== null}
        title="XÓA TÀI KHOẢN"
        message={`Bạn có chắc chắn muốn xóa mã Nick ${deleteConfirmId} khỏi cửa hàng không?`}
        confirmText="Xóa tài khoản"
        cancelText="Hủy bỏ"
        onConfirm={() => {
          if (deleteConfirmId) {
            onDeleteAccount(deleteConfirmId);
            setDeleteConfirmId(null);
          }
        }}
        onCancel={() => setDeleteConfirmId(null)}
      />

      {/* Confirm Dialog for Deleting Category */}
      <ConfirmDialog
        isOpen={deleteCategoryConfirm !== null}
        title="XÓA DANH MỤC"
        message={`Bạn có chắc chắn muốn xóa danh mục "${deleteCategoryConfirm}" không? Tất cả các tài khoản đang thuộc danh mục này sẽ tự động chuyển sang danh mục mặc định khác.`}
        confirmText="Xác nhận xóa"
        cancelText="Hủy bỏ"
        onConfirm={() => {
          if (deleteCategoryConfirm) {
            onDeleteCategory(deleteCategoryConfirm);
            setDeleteCategoryConfirm(null);
          }
        }}
        onCancel={() => setDeleteCategoryConfirm(null)}
      />
    </div>
  );
}
