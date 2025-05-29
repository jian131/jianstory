-- Thêm dữ liệu mẫu cho stories
INSERT INTO stories (
  title,
  slug,
  author,
  description,
  cover_image,
  total_chapters,
  view_count,
  rating_average,
  rating_count,
  status,
  is_featured,
  created_at,
  updated_at
) VALUES
(
  'Tam Sinh Tam Thế - Thập Lý Đào Hoa',
  'tam-sinh-tam-the-thap-ly-dao-hoa',
  'Đường Thất Công Tử',
  'Chuyện tình yêu giữa Bai Qian và Dạ Hoa, hai vị thần xuyên qua ba kiếp, ba thế để tìm thấy nhau.',
  '/sample-cover-1.jpg',
  58,
  125430,
  4.8,
  2547,
  'completed',
  true,
  NOW() - INTERVAL '30 days',
  NOW() - INTERVAL '5 days'
),
(
  'Võ Luyện Đỉnh Phong',
  'vo-luyen-dinh-phong',
  'Momo',
  'Dương Khai bước đầu vào con đường tu luyện, từ một thiếu niên bình thường trở thành cao thủ võ học.',
  '/sample-cover-2.jpg',
  156,
  89120,
  4.6,
  1823,
  'ongoing',
  true,
  NOW() - INTERVAL '60 days',
  NOW() - INTERVAL '1 day'
),
(
  'Đấu Phá Thương Khung',
  'dau-pha-thuong-khung',
  'Thiên Tằm Thổ Đậu',
  'Tiêu Viêm từ một thiên tài sa sút trở thành Đấu Đế, câu chuyện về nghị lực và quyết tâm.',
  '/sample-cover-3.jpg',
  200,
  245780,
  4.9,
  4521,
  'completed',
  false,
  NOW() - INTERVAL '90 days',
  NOW() - INTERVAL '10 days'
);

-- Thêm dữ liệu mẫu cho chapters
INSERT INTO chapters (
  story_id,
  title,
  slug,
  chapter_number,
  content,
  word_count,
  created_at,
  updated_at
) VALUES
-- Chapters cho Tam Sinh Tam Thế
(
  1,
  'Lâm thể nào để chia uyên rẽ thủy',
  'lam-the-nao-de-chia-uyen-re-thuy',
  4,
  '<p>Đông Hải Thủy Quân đi trước dẫn đường, cục bột nhỏ một mình run run đi giữa, Dạ Hoa nắm tay ta đi sau cùng. Chẳng qua ta chỉ nói đỡi một câu, câu nói đỡi này chủ yếu là để bảo vệ cục bột nhỏ, hắn có thể mặt nhăn mặt mờ cho qua, vậy mà lại đỡi ta, quả thực là làm người ta phát điên lên.</p>

<p>Ta cũng chẳng thèm giữ phong thái của bậc thượng thần, đứt khoát dùng pháp thuật để tách ra khỏi hắn. Hắn mím cười một cái, cũng dùng pháp thuật để chặn ta lại. Suốt đọc đường ta và hắn đấu lẫn nhau, hắn ý thể nên chẳng thèm kiềng đế, còn ta thi chớc chớc lại để chứng động tình của Đông Hải Thủy Quân phía trước nên phần tâm, đến cuối cùng vẫn là thầm bại.</p>

<p>Trước đó không lâu từ ca tự nói với ta rằng, thế dao ngày nay thực sự kém xa thời các thần tiên thượng cổ năm nào, chúng tiên chỉ biết tiêu dao tự tại cả ngày, tiên thuật chẳng tinh, đao phong suy đổi, thực khiến người ta đau lòng khôn xiết. Chẳng ngờ dao pháp của Dạ Hoa lại tinh thâm đến mức này, đúng là "tiên thuật chẳng tinh" ông nhà nó, "đao phong suy đổi" con bà nó ấy chứ.</p>

<p>Đông Hải Thủy Quân quay đầu lại, bồi thêm một nụ cười, hai mắt văn nheo nheo nhìn ta và Dạ Hoa tay trong tay: "Quân thượng, tiên sứ, phía trước đã là đại điện rồi".</p>

<p>Cực bột nhỏ reo lên một tiếng, khéo léo chạy đến nắm lấy cánh tay còn trống của ta, ra điều bộ trang trong uy nghiệm chầu trai của Thiên Quân.</p>',
  1250,
  NOW() - INTERVAL '25 days',
  NOW() - INTERVAL '25 days'
),
(
  1,
  'Chương 5: Thiên Quân và tiên nữ',
  'chuong-5-thien-quan-va-tien-nu',
  5,
  '<p>Nếu đặt vào vị trí của ta hiện giờ là vị thứ phi đang ở tại Thiên Cung của Dạ Hoa thì xếp hàng như vậy quả hợp tình hợp lý, không có gì là quá đáng cả.</p>

<p>Ngày hôm nay, khi biết Chiết Nhan, đang nhé nên báo lão bối cho ta một quê. Có lẽ hôm nay chính là ngày xung khác với ngày sinh tháng để của ta. Cảnh cửa bằng vàng bằng ngọc đã hiện ra trước mặt, đầu của thượng thần ta lúc này có chút nhoi đau.</p>

<p>Thân tiến trong đại điện đều mới mặt choá với ta và Dạ Hoa tay trong tay: "Quân thượng, tiên sứ, phía trước đã là đại điện rồi". Đối ba người chứng ta an vi, hồ bên quý suất xuống thành hai hàng, mở một lối đi ở giữa, đi thẳng tới vị trí của chủ nhân. Vì đất vào vi tri của ta hiện giờ là vị thứ phi đang ở tại Thiên Cung của Dạ Hoa thì xếp hàng như vậy quả hợp tình hợp lý, không có gì là quá đáng cả.</p>',
  980,
  NOW() - INTERVAL '20 days',
  NOW() - INTERVAL '20 days'
),
-- Chapters cho Võ Luyện Đỉnh Phong
(
  2,
  'Chương 1: Thiếu niên Dương Khai',
  'chuong-1-thieu-nien-duong-khai',
  1,
  '<p>Tại Lingxiao Pavilion, một thiếu niên tầm mười bảy tuổi đang quét rác. Thiếu niên này có gương mặt bình thường, nhưng đôi mắt sáng ngời, thể hiện sự kiên định và nghị lực không bình thường.</p>

<p>Dương Khai, đó là tên của thiếu niên này. Hắn là một đệ tử thí luyện của Lingxiao Pavilion, địa vị thấp nhất trong môn phái.</p>

<p>Hôm nay, như mọi ngày khác, Dương Khai thực hiện công việc quét dọn của mình. Nhưng trong lòng, hắn luôn ấp ủ một ước mơ lớn lao - trở thành một cao thủ võ học, có thể bảo vệ những người hắn yêu thương.</p>

<p>"Dương Khai! Mau lên, đừng lười biếng!" Một tiếng quát vang lên từ phía sau.</p>

<p>Dương Khai quay lại, thấy một đệ tử cao cấp đang nhìn hắn với ánh mắt khinh thường. Hắn cúi đầu, tiếp tục công việc của mình, nhưng trong lòng đã âm thầm thề nguyền.</p>',
  1150,
  NOW() - INTERVAL '10 days',
  NOW() - INTERVAL '10 days'
),
(
  2,
  'Chương 2: Bí mật trong rác',
  'chuong-2-bi-mat-trong-rac',
  2,
  '<p>Trong lúc quét rác ở kho cũ, Dương Khai vô tình phát hiện một viên đá màu đen kỳ lạ. Viên đá này toát ra một khí tức bí ẩn, khiến hắn cảm thấy có điều gì đó đặc biệt.</p>

<p>Khi cầm viên đá lên, Dương Khai đột nhiên cảm thấy một luồng năng lượng lạ chảy vào cơ thể. Đây chính là khởi đầu cho hành trình tu luyện của hắn.</p>

<p>"Đây là gì vậy?" Dương Khai tự hỏi, nhưng bản năng cho hắn biết rằng đây là cơ hội của đời mình.</p>

<p>Từ ngày đó, Dương Khai bắt đầu thực hiện những bài tập võ cơ bản một cách nghiêm túc hơn, với hy vọng có thể khám phá thêm về viên đá bí ẩn này.</p>',
  890,
  NOW() - INTERVAL '8 days',
  NOW() - INTERVAL '8 days'
);
