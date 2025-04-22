import express from 'express';
import cors from 'cors';
import axios from 'axios';
const app = express();
const PORT = 3001;

// 微信开放平台配置
const WECHAT_CONFIG = {
  appid: '', // 替换为您的appid
  secret: '', // 替换为您的secret
};

// 启用CORS
app.use(cors());
app.use(express.json());

// 处理获取access_token的请求
app.post("/api/wechat/access_token", async (req, res) => {
    try {
      const { code } = req.body;
  
      if (!code) {
        return res.status(400).json({ error: "缺少code参数" });
      }
      // 请求微信API获取access_token
      const tokenUrl = `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${WECHAT_CONFIG.appid}&secret=${WECHAT_CONFIG.secret}&code=${code}&grant_type=authorization_code`;
      const tokenResponse = await axios.get(tokenUrl);
      const tokenData = tokenResponse.data;
      if (tokenData.errcode) {
        return res.json({ success: false, message: `微信API错误: ${tokenData.errmsg}` });
      }
      // 获取用户信息
      const userInfoUrl = `https://api.weixin.qq.com/sns/userinfo?access_token=${tokenData.access_token}&openid=${tokenData.openid}&lang=zh_CN`;
      const userInfoResponse = await axios.get(userInfoUrl);
      const userInfo = userInfoResponse.data;
  
      if (userInfo.errcode) {
        return res.json({ success: false, message: `获取用户信息失败: ${userInfo.errmsg}` });
      }
      console.log(userInfo);
      // 初始化用户，没注册的新建用户
      let user = new UserClass();
      let info = await user.init(
        {
          "wechat": userInfo.openid,
          scope: "basic",
        },
        "wechat",
      );
      let token = jsonwebtoken.sign(info, process.env.JWT_PRIVATE_KEY, {
        expiresIn: "180d",
      });
      res.json({
        success: true,
        result: token,
        message: "登录成功",
        info: userInfo,
      });
    } catch (error) {
      console.error("处理access_token请求时出错:", error);
      res.status(500).json({ error: "服务器内部错误" });
    }
  });
  

// 启动服务器
app.listen(PORT, () => {
  console.log(`微信登录服务器运行在 http://localhost:${PORT}`);
  console.log('注意: 请将微信开放平台的appid和secret替换为您自己的');
});