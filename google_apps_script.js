/**
 * GOOGLE APPS SCRIPT CHO HỆ THỐNG ĐỒNG BỘ ĐIỂM & BẢNG XẾP HẠNG TOÀN QUỐC
 * ỨNG DỤNG DI TÍCH ĐỀN HAI BÀ TRƯNG (HÀ NỘI) - TIẾNG ANH LỚP 6
 * 
 * HƯỚNG DẪN CÀI ĐẶT:
 * 1. Mở một Google Trang tính (Google Sheets) mới trên Google Drive.
 * 2. Trên thanh menu, chọn: Tiện ích mở rộng (Extensions) -> Apps Script.
 * 3. Xóa toàn bộ nội dung cũ trong trình soạn thảo, dán toàn bộ đoạn mã này vào.
 * 4. Nhấn nút "Lưu" (biểu tượng đĩa mềm hoặc Ctrl + S).
 * 5. Bạn có thể chọn hàm "chayKiemTra" hoặc "setupSheetHeaders" rồi bấm "Chạy" để tạo sẵn các sheet!
 * 6. Nhấn nút "Triển khai" (Deploy) ở góc trên bên phải -> Chọn "Tùy chọn triển khai mới" (New deployment).
 * 7. Chọn loại: "Ứng dụng web" (Web app).
 *    - Mô tả: "HBT Shrine Ranking API"
 *    - Thực thi dưới dạng (Execute as): "Tôi" (Me)
 *    - Ai có quyền truy cập (Who has access): "Bất kỳ ai" (Anyone).
 * 8. Nhấn "Triển khai" (Deploy), cấp quyền truy cập nếu Google hỏi, sau đó sao chép "URL ứng dụng web" (Web App URL).
 * 9. Dán URL này vào mục "Hồ sơ học sinh" -> "Cài đặt Google Sheet" trong ứng dụng là xong!
 */

// Hàm thiết lập tiêu đề các sheet (hỗ trợ bấm nút "Chạy" trực tiếp không bị lỗi)
function setupSheetHeaders(ss) {
  // Nếu ss không được truyền vào khi bấm nút "Chạy", tự động lấy Trang tính hiện tại
  if (!ss) {
    ss = SpreadsheetApp.getActiveSpreadsheet();
  }

  if (!ss) {
    Logger.log("LỖI: Không tìm thấy Trang tính liên kết. Hãy đảm bảo bạn mở Apps Script từ menu 'Tiện ích mở rộng' -> 'Apps Script' trong Google Sheets!");
    return null;
  }

  // 1. Tạo hoặc kiểm tra Sheet "Students"
  var studentsSheet = ss.getSheetByName("Students");
  if (!studentsSheet) {
    studentsSheet = ss.insertSheet("Students");
    studentsSheet.appendRow([
      "Mã Học Sinh (ID)",
      "Họ và Tên (Full Name)",
      "Trường (School)",
      "Lớp (Class)",
      "Tổng Điểm (Score)",
      "Thời Gian Học (Giây)",
      "Hoạt Động Gần Nhất",
      "Thời Gian Cập Nhật"
    ]);
    studentsSheet.getRange("A1:H1").setFontWeight("bold").setBackground("#b45309").setFontColor("#ffffff");
    studentsSheet.setFrozenRows(1);
  }

  // 2. Tạo hoặc kiểm tra Sheet "ActivityLogs"
  var logsSheet = ss.getSheetByName("ActivityLogs");
  if (!logsSheet) {
    logsSheet = ss.insertSheet("ActivityLogs");
    logsSheet.appendRow([
      "Thời Gian",
      "Mã Học Sinh",
      "Họ và Tên",
      "Trường",
      "Lớp",
      "Nội Dung Hoạt Động",
      "Tổng Điểm Sau Cùng"
    ]);
    logsSheet.getRange("A1:G1").setFontWeight("bold").setBackground("#1e293b").setFontColor("#ffffff");
    logsSheet.setFrozenRows(1);
  }

  Logger.log("Đã khởi tạo thành công các bảng 'Students' và 'ActivityLogs'!");
  return ss;
}

// Hàm để bạn bấm nút "Chạy" kiểm tra thử trên Apps Script
function chayKiemTra() {
  setupSheetHeaders();
}

// Xử lý gửi dữ liệu lên (POST: Đăng ký & Cập nhật điểm theo thời gian thực)
function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);
  
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    setupSheetHeaders(ss);
    
    var rawData = e && e.postData ? e.postData.contents : "";
    var data = {};
    if (rawData) {
      try {
        data = JSON.parse(rawData);
      } catch (err) {
        data = e.parameter || {};
      }
    } else if (e && e.parameter) {
      data = e.parameter;
    }

    var studentsSheet = ss.getSheetByName("Students");
    var logsSheet = ss.getSheetByName("ActivityLogs");
    var nowStr = Utilities.formatDate(new Date(), "Asia/Ho_Chi_Minh", "dd/MM/yyyy HH:mm:ss");

    var studentId = data.id || "HBT-UNKNOWN";
    var fullName = data.fullName || "Học sinh";
    var school = data.school || "";
    var className = data.className || "";
    var score = Number(data.score) || 0;
    var learningTimeSeconds = Number(data.learningTimeSeconds) || 0;
    var activity = data.latestActivity || data.activity || "Đăng ký ứng dụng";

    // Tìm xem học sinh đã có dòng nào chưa
    var rows = studentsSheet.getDataRange().getValues();
    var rowIndex = -1;
    for (var i = 1; i < rows.length; i++) {
      if (rows[i][0] == studentId || (rows[i][1] == fullName && rows[i][2] == school)) {
        rowIndex = i + 1; // 1-indexed trong Sheets
        break;
      }
    }

    if (rowIndex > 0) {
      // Cập nhật học sinh hiện có
      studentsSheet.getRange(rowIndex, 4).setValue(className);
      studentsSheet.getRange(rowIndex, 5).setValue(score);
      studentsSheet.getRange(rowIndex, 6).setValue(learningTimeSeconds);
      studentsSheet.getRange(rowIndex, 7).setValue(activity);
      studentsSheet.getRange(rowIndex, 8).setValue(nowStr);
    } else {
      // Thêm học sinh mới
      studentsSheet.appendRow([
        studentId,
        fullName,
        school,
        className,
        score,
        learningTimeSeconds,
        activity,
        nowStr
      ]);
    }

    // Ghi nhật ký vào sheet ActivityLogs
    if (logsSheet) {
      logsSheet.appendRow([
        nowStr,
        studentId,
        fullName,
        school,
        className,
        activity,
        score
      ]);
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Đồng bộ thành công!",
      studentId: studentId,
      score: score
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

// Xử lý lấy Bảng xếp hạng trực tiếp (GET)
function doGet(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    setupSheetHeaders(ss);
    var studentsSheet = ss.getSheetByName("Students");
    
    var data = studentsSheet.getDataRange().getValues();
    var leaderboard = [];
    
    // Bỏ qua dòng tiêu đề dòng 0
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      if (row[1]) { // Có họ và tên
        leaderboard.push({
          id: String(row[0]),
          fullName: String(row[1]),
          school: String(row[2]),
          className: String(row[3]),
          score: Number(row[4]) || 0,
          learningTimeSeconds: Number(row[5]) || 0,
          lastActive: String(row[7] || "Hôm nay")
        });
      }
    }

    // Sắp xếp theo điểm giảm dần, thời gian học nhanh hơn nếu cùng điểm
    leaderboard.sort(function(a, b) {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return a.learningTimeSeconds - b.learningTimeSeconds;
    });

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      totalStudents: leaderboard.length,
      leaderboard: leaderboard
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString(),
      leaderboard: []
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
