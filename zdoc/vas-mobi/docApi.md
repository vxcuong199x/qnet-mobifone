##Tài liệu kết nối STV - Qnet - Mobifone##

### 1. Thông tin chung ###
- URL: http://10.2.10.4:8003

### 2. API gửi OTP/PASS cho khách hàng ###
- Mục đích: hệ thống gửi otp/pass sang Mobi, Mobi gửi sang khách hàng khi mỗi lần khách hàng Login (khi đã mua gói cước sms)
- API: /sendMt
- Method: post
- Request:	
		
| Params    | Required | DataType | Example | Note
| --------- | -----:| --------- | -----:| --------- |
| isdn     |   true | string |'0904956888'|Số điện thoại|
| content     |   true | string |'123456'|mã OTP/Pass|

- Response: JSON

		+ Success: {CODE: 0, MESSAGE:'SUCCESS']} 
		+ Error:  {CODE: code, MESSAGE:msg, SUB_MESSAGE:sub_msg} //code !=0, msg: message error, sub_msg: detail message error
		
