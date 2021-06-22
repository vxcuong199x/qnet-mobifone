# Tài liệu mô tả Service kết nối Qnet với Mobifone
  
### 1. Api update trạng thái gói cước
##### - Mục đích: Hệ thống Charging CSP sẽ update trạng thái gói cước thuê bao theo kịch bản khi nhận được thông báo đăng kí/hủy/gia hạn gói cước của thuê bao từ service SMSGW của Mobifone    
##### - Thông tin API:    
- Url: `http://10.54.26.126:8003/updatePackage`
- Method: `POST`
- Header: `Content-Type: application/json`
- Body: `JSON` - Theo như tài liệu mobifone quy định sẵn
- Response: `JSON` - Theo như tài liệu mobifone quy định sẵn
       
                    

        
             
            
       
       
       
