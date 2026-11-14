-- Add 466 reviewed synonyms to missing fields only. Safe to rerun.
-- Run in the Supabase SQL Editor. Existing synonyms and all other payload fields are preserved.
BEGIN;
WITH additions AS (
  SELECT * FROM jsonb_to_recordset($synonyms$
[
  {
    "id": "6",
    "chinese": "保险箱",
    "synonyms": "保险柜"
  },
  {
    "id": "10",
    "chinese": "周一",
    "synonyms": "星期一;礼拜一"
  },
  {
    "id": "50",
    "chinese": "受欢迎",
    "synonyms": "受人喜爱"
  },
  {
    "id": "79",
    "chinese": "排练",
    "synonyms": "演练"
  },
  {
    "id": "92",
    "chinese": "英里",
    "synonyms": "哩"
  },
  {
    "id": "97",
    "chinese": "十一长假",
    "synonyms": "国庆长假"
  },
  {
    "id": "118",
    "chinese": "衣柜",
    "synonyms": "衣橱"
  },
  {
    "id": "129",
    "chinese": "行李",
    "synonyms": "行装"
  },
  {
    "id": "135",
    "chinese": "同事",
    "synonyms": "同僚"
  },
  {
    "id": "183",
    "chinese": "熊猫",
    "synonyms": "大熊猫"
  },
  {
    "id": "234",
    "chinese": "汽水",
    "synonyms": "碳酸饮料"
  },
  {
    "id": "242",
    "chinese": "番茄酱",
    "synonyms": "西红柿酱"
  },
  {
    "id": "294",
    "chinese": "长期",
    "synonyms": "长久;长时间"
  },
  {
    "id": "306",
    "chinese": "起义",
    "synonyms": "起事"
  },
  {
    "id": "316",
    "chinese": "说实话",
    "synonyms": "说真的;坦白说"
  },
  {
    "id": "359",
    "chinese": "空调",
    "synonyms": "空气调节器"
  },
  {
    "id": "366",
    "chinese": "零件",
    "synonyms": "部件;配件"
  },
  {
    "id": "380",
    "chinese": "钱包",
    "synonyms": "钱夹"
  },
  {
    "id": "383",
    "chinese": "內裤",
    "synonyms": "内裤"
  },
  {
    "id": "387",
    "chinese": "左右",
    "synonyms": "大约;上下"
  },
  {
    "id": "388",
    "chinese": "东西",
    "synonyms": "物品;物件"
  },
  {
    "id": "413",
    "chinese": "水平",
    "synonyms": "水准"
  },
  {
    "id": "424",
    "chinese": "树荫",
    "synonyms": "树阴"
  },
  {
    "id": "425",
    "chinese": "电影",
    "synonyms": "影片"
  },
  {
    "id": "431",
    "chinese": "手表",
    "synonyms": "腕表"
  },
  {
    "id": "432",
    "chinese": "图表",
    "synonyms": "图示"
  },
  {
    "id": "441",
    "chinese": "开口",
    "synonyms": "张口"
  },
  {
    "id": "459",
    "chinese": "偏头痛",
    "synonyms": "偏头疼"
  },
  {
    "id": "474",
    "chinese": "杀鸡吓猴",
    "synonyms": "杀鸡儆猴"
  },
  {
    "id": "479",
    "chinese": "闭嘴",
    "synonyms": "住口"
  },
  {
    "id": "486",
    "chinese": "维生素",
    "synonyms": "维他命"
  },
  {
    "id": "490",
    "chinese": "今晚",
    "synonyms": "今夜"
  },
  {
    "id": "494",
    "chinese": "分不清",
    "synonyms": "辨不清;分辨不清"
  },
  {
    "id": "508",
    "chinese": "大多数",
    "synonyms": "大部分;多数"
  },
  {
    "id": "523",
    "chinese": "共情",
    "synonyms": "同理心"
  },
  {
    "id": "529",
    "chinese": "自卫",
    "synonyms": "自我防卫"
  },
  {
    "id": "540",
    "chinese": "面部识别",
    "synonyms": "人脸识别"
  },
  {
    "id": "552",
    "chinese": "娱乐场",
    "synonyms": "娱乐场所"
  },
  {
    "id": "558",
    "chinese": "书桌",
    "synonyms": "写字台"
  },
  {
    "id": "574",
    "chinese": "路口",
    "synonyms": "交叉口"
  },
  {
    "id": "597",
    "chinese": "据我所知",
    "synonyms": "就我所知"
  },
  {
    "id": "608",
    "chinese": "钥匙扣",
    "synonyms": "钥匙圈"
  },
  {
    "id": "621",
    "chinese": "农历",
    "synonyms": "夏历"
  },
  {
    "id": "625",
    "chinese": "没错",
    "synonyms": "对;正确"
  },
  {
    "id": "647",
    "chinese": "婚礼",
    "synonyms": "结婚典礼"
  },
  {
    "id": "650",
    "chinese": "按摩",
    "synonyms": "推拿"
  },
  {
    "id": "653",
    "chinese": "简历",
    "synonyms": "个人履历"
  },
  {
    "id": "658",
    "chinese": "拉黑",
    "synonyms": "加入黑名单"
  },
  {
    "id": "684",
    "chinese": "难处",
    "synonyms": "困难;难题"
  },
  {
    "id": "695",
    "chinese": "睡着了",
    "synonyms": "入睡了"
  },
  {
    "id": "702",
    "chinese": "随身的行李",
    "synonyms": "随身行李;手提行李"
  },
  {
    "id": "704",
    "chinese": "笔记本电脑",
    "synonyms": "笔电;便携式电脑"
  },
  {
    "id": "742",
    "chinese": "洗漱用品",
    "synonyms": "盥洗用品"
  },
  {
    "id": "755",
    "chinese": "通风",
    "synonyms": "透气;换气"
  },
  {
    "id": "770",
    "chinese": "未婚",
    "synonyms": "未成婚"
  },
  {
    "id": "780",
    "chinese": "熬夜",
    "synonyms": "熬更守夜"
  },
  {
    "id": "786",
    "chinese": "报到",
    "synonyms": "签到"
  },
  {
    "id": "807",
    "chinese": "意式浓缩",
    "synonyms": "浓缩咖啡"
  },
  {
    "id": "841",
    "chinese": "难得",
    "synonyms": "少有;罕见"
  },
  {
    "id": "846",
    "chinese": "减肥",
    "synonyms": "减重;瘦身"
  },
  {
    "id": "858",
    "chinese": "跳动",
    "synonyms": "搏动"
  },
  {
    "id": "886",
    "chinese": "回信",
    "synonyms": "复信"
  },
  {
    "id": "887",
    "chinese": "标点",
    "synonyms": "标点符号"
  },
  {
    "id": "919",
    "chinese": "义务",
    "synonyms": "责任;本分"
  },
  {
    "id": "964",
    "chinese": "酒后驾车",
    "synonyms": "酒驾;酒后驾驶"
  },
  {
    "id": "965",
    "chinese": "外语",
    "synonyms": "外国语言"
  },
  {
    "id": "984",
    "chinese": "交警",
    "synonyms": "交通警察"
  },
  {
    "id": "1000",
    "chinese": "帅哥",
    "synonyms": "俊男;美男子"
  },
  {
    "id": "1003",
    "chinese": "简介",
    "synonyms": "简要介绍"
  },
  {
    "id": "1004",
    "chinese": "大一",
    "synonyms": "大学一年级"
  },
  {
    "id": "1005",
    "chinese": "大二",
    "synonyms": "大学二年级"
  },
  {
    "id": "1006",
    "chinese": "大三",
    "synonyms": "大学三年级"
  },
  {
    "id": "1007",
    "chinese": "大四",
    "synonyms": "大学四年级"
  },
  {
    "id": "1019",
    "chinese": "缩写",
    "synonyms": "缩略形式"
  },
  {
    "id": "1034",
    "chinese": "养老院",
    "synonyms": "敬老院"
  },
  {
    "id": "1078",
    "chinese": "参赛",
    "synonyms": "参加比赛"
  },
  {
    "id": "1090",
    "chinese": "青春痘",
    "synonyms": "痤疮"
  },
  {
    "id": "1096",
    "chinese": "成名",
    "synonyms": "出名;扬名"
  },
  {
    "id": "1111",
    "chinese": "泳衣",
    "synonyms": "泳装"
  },
  {
    "id": "1148",
    "chinese": "理所当然",
    "synonyms": "天经地义"
  },
  {
    "id": "1165",
    "chinese": "避孕套",
    "synonyms": "安全套;保险套"
  },
  {
    "id": "1170",
    "chinese": "流浪狗",
    "synonyms": "流浪犬"
  },
  {
    "id": "1185",
    "chinese": "甜甜圈",
    "synonyms": "油炸圈饼"
  },
  {
    "id": "1186",
    "chinese": "油炸圈饼",
    "synonyms": "甜甜圈"
  },
  {
    "id": "1194",
    "chinese": "肉丸",
    "synonyms": "肉丸子"
  },
  {
    "id": "1199",
    "chinese": "轮渡",
    "synonyms": "渡轮"
  },
  {
    "id": "1202",
    "chinese": "掉头",
    "synonyms": "调头"
  },
  {
    "id": "1203",
    "chinese": "绕道",
    "synonyms": "绕路"
  },
  {
    "id": "1212",
    "chinese": "车牌",
    "synonyms": "车辆号牌"
  },
  {
    "id": "1222",
    "chinese": "收起来",
    "synonyms": "收好"
  },
  {
    "id": "1257",
    "chinese": "延毕",
    "synonyms": "延迟毕业;延期毕业"
  },
  {
    "id": "1260",
    "chinese": "豆腐脑",
    "synonyms": "豆花"
  },
  {
    "id": "1261",
    "chinese": "豆花",
    "synonyms": "豆腐脑"
  },
  {
    "id": "1312",
    "chinese": "前提条件",
    "synonyms": "先决条件"
  },
  {
    "id": "1323",
    "chinese": "电商",
    "synonyms": "电子商务"
  },
  {
    "id": "1341",
    "chinese": "强暴",
    "synonyms": "强奸"
  },
  {
    "id": "1360",
    "chinese": "关键词",
    "synonyms": "关键字"
  },
  {
    "id": "1364",
    "chinese": "尽可能",
    "synonyms": "尽量"
  },
  {
    "id": "1377",
    "chinese": "午睡",
    "synonyms": "午觉"
  },
  {
    "id": "1402",
    "chinese": "语法",
    "synonyms": "文法"
  },
  {
    "id": "1427",
    "chinese": "路标",
    "synonyms": "道路标志"
  },
  {
    "id": "1445",
    "chinese": "其次",
    "synonyms": "第二;再者"
  },
  {
    "id": "1453",
    "chinese": "恶评",
    "synonyms": "差评;负面评价"
  },
  {
    "id": "1502",
    "chinese": "厘米",
    "synonyms": "公分"
  },
  {
    "id": "1560",
    "chinese": "毫米",
    "synonyms": "公厘"
  },
  {
    "id": "1561",
    "chinese": "沙滩",
    "synonyms": "沙岸"
  },
  {
    "id": "1577",
    "chinese": "稀世",
    "synonyms": "罕见;举世罕见"
  },
  {
    "id": "1594",
    "chinese": "诈骗分子",
    "synonyms": "诈骗犯;骗子"
  },
  {
    "id": "1621",
    "chinese": "姓",
    "synonyms": "姓氏"
  },
  {
    "id": "1626",
    "chinese": "车祸",
    "synonyms": "行车事故"
  },
  {
    "id": "1631",
    "chinese": "不均",
    "synonyms": "不均匀"
  },
  {
    "id": "1641",
    "chinese": "安全套",
    "synonyms": "避孕套;保险套"
  },
  {
    "id": "1660",
    "chinese": "股市",
    "synonyms": "股票市场"
  },
  {
    "id": "1668",
    "chinese": "网上搜索",
    "synonyms": "上网搜索"
  },
  {
    "id": "1669",
    "chinese": "更喜欢",
    "synonyms": "更偏爱"
  },
  {
    "id": "1700",
    "chinese": "差点儿",
    "synonyms": "差一点;几乎"
  },
  {
    "id": "1717",
    "chinese": "景点",
    "synonyms": "旅游景点"
  },
  {
    "id": "1721",
    "chinese": "离店",
    "synonyms": "退房"
  },
  {
    "id": "1798",
    "chinese": "没事儿",
    "synonyms": "没关系;不要紧"
  },
  {
    "id": "1820",
    "chinese": "都可以",
    "synonyms": "都行;随便"
  },
  {
    "id": "1828",
    "chinese": "请稍等",
    "synonyms": "请稍候"
  },
  {
    "id": "1829",
    "chinese": "不怎么样",
    "synonyms": "不太好"
  },
  {
    "id": "1831",
    "chinese": "还不错",
    "synonyms": "还可以;还行"
  },
  {
    "id": "1837",
    "chinese": "馄饨",
    "synonyms": "云吞;抄手"
  },
  {
    "id": "1849",
    "chinese": "蛋黄",
    "synonyms": "卵黄"
  },
  {
    "id": "1951",
    "chinese": "芝士碎",
    "synonyms": "奶酪碎"
  },
  {
    "id": "1956",
    "chinese": "豆皮",
    "synonyms": "豆腐皮"
  },
  {
    "id": "1971",
    "chinese": "餐巾纸",
    "synonyms": "餐纸"
  },
  {
    "id": "1993",
    "chinese": "蔬菜",
    "synonyms": "菜蔬"
  },
  {
    "id": "2044",
    "chinese": "金桔",
    "synonyms": "金橘"
  },
  {
    "id": "2068",
    "chinese": "心情不好",
    "synonyms": "情绪低落"
  },
  {
    "id": "2074",
    "chinese": "等等",
    "synonyms": "诸如此类"
  },
  {
    "id": "2079",
    "chinese": "共享办公室",
    "synonyms": "共享办公空间"
  },
  {
    "id": "2131",
    "chinese": "当兵",
    "synonyms": "参军;入伍"
  },
  {
    "id": "2195",
    "chinese": "毒贩子",
    "synonyms": "毒贩;贩毒者"
  },
  {
    "id": "2207",
    "chinese": "之类",
    "synonyms": "诸如此类"
  },
  {
    "id": "2234",
    "chinese": "风评",
    "synonyms": "口碑;社会评价"
  },
  {
    "id": "2306",
    "chinese": "人尽皆知",
    "synonyms": "众所周知;家喻户晓"
  },
  {
    "id": "2308",
    "chinese": "照抄",
    "synonyms": "照搬;抄录"
  },
  {
    "id": "2318",
    "chinese": "点单",
    "synonyms": "点餐;下单"
  },
  {
    "id": "2348",
    "chinese": "舒适",
    "synonyms": "舒服;舒坦"
  },
  {
    "id": "2349",
    "chinese": "详情",
    "synonyms": "详细情况"
  },
  {
    "id": "2352",
    "chinese": "地下室",
    "synonyms": "地库"
  },
  {
    "id": "2389",
    "chinese": "直达",
    "synonyms": "直通"
  },
  {
    "id": "2394",
    "chinese": "预订",
    "synonyms": "预先订购"
  },
  {
    "id": "2395",
    "chinese": "去处",
    "synonyms": "去的地方"
  },
  {
    "id": "2450",
    "chinese": "生意",
    "synonyms": "买卖"
  },
  {
    "id": "2451",
    "chinese": "退休金",
    "synonyms": "养老金"
  },
  {
    "id": "2460",
    "chinese": "原籍",
    "synonyms": "籍贯"
  },
  {
    "id": "2463",
    "chinese": "寻",
    "synonyms": "寻找;寻觅"
  },
  {
    "id": "2495",
    "chinese": "社保",
    "synonyms": "社会保险"
  },
  {
    "id": "2498",
    "chinese": "国企",
    "synonyms": "国有企业"
  },
  {
    "id": "2499",
    "chinese": "央企",
    "synonyms": "中央企业"
  },
  {
    "id": "2613",
    "chinese": "押金",
    "synonyms": "押款"
  },
  {
    "id": "2634",
    "chinese": "举例",
    "synonyms": "举例子"
  },
  {
    "id": "2710",
    "chinese": "顾客",
    "synonyms": "客户;客人"
  },
  {
    "id": "2711",
    "chinese": "博客",
    "synonyms": "部落格"
  },
  {
    "id": "2727",
    "chinese": "风扇",
    "synonyms": "电风扇"
  },
  {
    "id": "2740",
    "chinese": "公开场合",
    "synonyms": "公共场合"
  },
  {
    "id": "2746",
    "chinese": "蔬果",
    "synonyms": "蔬菜水果"
  },
  {
    "id": "2754",
    "chinese": "大部分",
    "synonyms": "大多数;大半"
  },
  {
    "id": "2773",
    "chinese": "交朋友",
    "synonyms": "交友;结交朋友"
  },
  {
    "id": "2799",
    "chinese": "左拐",
    "synonyms": "左转"
  },
  {
    "id": "2846",
    "chinese": "短期",
    "synonyms": "短时间"
  },
  {
    "id": "2982",
    "chinese": "对象",
    "synonyms": "恋人;伴侣"
  },
  {
    "id": "3030",
    "chinese": "电子表格",
    "synonyms": "电子试算表"
  },
  {
    "id": "3085",
    "chinese": "月中",
    "synonyms": "月的中旬"
  },
  {
    "id": "3092",
    "chinese": "晕动病",
    "synonyms": "运动病"
  },
  {
    "id": "3140",
    "chinese": "甜品店",
    "synonyms": "甜点店"
  },
  {
    "id": "3159",
    "chinese": "很久以前",
    "synonyms": "很早以前"
  },
  {
    "id": "3168",
    "chinese": "很划算",
    "synonyms": "很合算"
  },
  {
    "id": "3285",
    "chinese": "友好",
    "synonyms": "友善;友爱"
  },
  {
    "id": "3356",
    "chinese": "逃课",
    "synonyms": "旷课"
  },
  {
    "id": "3364",
    "chinese": "交通事故",
    "synonyms": "交通意外"
  },
  {
    "id": "3380",
    "chinese": "癌症",
    "synonyms": "恶性肿瘤"
  },
  {
    "id": "3425",
    "chinese": "四月末",
    "synonyms": "四月底"
  },
  {
    "id": "3426",
    "chinese": "四月底",
    "synonyms": "四月末"
  },
  {
    "id": "3434",
    "chinese": "工作岗位",
    "synonyms": "职位;岗位"
  },
  {
    "id": "3435",
    "chinese": "工作机会",
    "synonyms": "就业机会"
  },
  {
    "id": "3466",
    "chinese": "外卖员",
    "synonyms": "外卖骑手;送餐员"
  },
  {
    "id": "3491",
    "chinese": "往返机票",
    "synonyms": "来回机票"
  },
  {
    "id": "3514",
    "chinese": "乐谱",
    "synonyms": "曲谱"
  },
  {
    "id": "3546",
    "chinese": "降价",
    "synonyms": "减价"
  },
  {
    "id": "3547",
    "chinese": "涨价",
    "synonyms": "提价"
  },
  {
    "id": "3565",
    "chinese": "延迟毕业",
    "synonyms": "延期毕业;延毕"
  },
  {
    "id": "3585",
    "chinese": "在我看来",
    "synonyms": "依我看;我认为"
  },
  {
    "id": "3652",
    "chinese": "烘干",
    "synonyms": "烘燥"
  },
  {
    "id": "3659",
    "chinese": "绳子",
    "synonyms": "绳索"
  },
  {
    "id": "3702",
    "chinese": "第二天",
    "synonyms": "次日;翌日"
  },
  {
    "id": "3712",
    "chinese": "包邮",
    "synonyms": "免运费"
  },
  {
    "id": "3727",
    "chinese": "点击",
    "synonyms": "点选"
  },
  {
    "id": "3747",
    "chinese": "性病",
    "synonyms": "性传播疾病"
  },
  {
    "id": "3750",
    "chinese": "提成",
    "synonyms": "抽成"
  },
  {
    "id": "3771",
    "chinese": "屋里",
    "synonyms": "屋内;室内"
  },
  {
    "id": "3772",
    "chinese": "屋外",
    "synonyms": "屋外面;室外"
  },
  {
    "id": "3779",
    "chinese": "很难说",
    "synonyms": "难说;不好说"
  },
  {
    "id": "3795",
    "chinese": "专注于",
    "synonyms": "专心于;集中于"
  },
  {
    "id": "3797",
    "chinese": "字典",
    "synonyms": "字书"
  },
  {
    "id": "3800",
    "chinese": "验血",
    "synonyms": "血液检验"
  },
  {
    "id": "3814",
    "chinese": "无论如何",
    "synonyms": "不管怎样;无论怎样"
  },
  {
    "id": "3817",
    "chinese": "丢",
    "synonyms": "丢失;遗失"
  },
  {
    "id": "3826",
    "chinese": "免运费",
    "synonyms": "包邮"
  },
  {
    "id": "3842",
    "chinese": "个人资料",
    "synonyms": "个人信息"
  },
  {
    "id": "3878",
    "chinese": "将信将疑",
    "synonyms": "半信半疑"
  },
  {
    "id": "3893",
    "chinese": "各种各样",
    "synonyms": "各式各样;形形色色"
  },
  {
    "id": "3909",
    "chinese": "视频电话",
    "synonyms": "视频通话"
  },
  {
    "id": "3929",
    "chinese": "盘子",
    "synonyms": "碟子"
  },
  {
    "id": "3942",
    "chinese": "租赁合同",
    "synonyms": "租约"
  },
  {
    "id": "3989",
    "chinese": "总和",
    "synonyms": "合计;总计"
  },
  {
    "id": "4013",
    "chinese": "一无所知",
    "synonyms": "毫不知情"
  },
  {
    "id": "4018",
    "chinese": "敌意",
    "synonyms": "敌对情绪"
  },
  {
    "id": "4029",
    "chinese": "视频通话",
    "synonyms": "视频电话"
  },
  {
    "id": "4046",
    "chinese": "流口水",
    "synonyms": "垂涎"
  },
  {
    "id": "4073",
    "chinese": "头皮屑",
    "synonyms": "头屑"
  },
  {
    "id": "4145",
    "chinese": "毫无疑问",
    "synonyms": "毋庸置疑;无疑"
  },
  {
    "id": "4149",
    "chinese": "频繁",
    "synonyms": "频仍"
  },
  {
    "id": "4165",
    "chinese": "一路顺风",
    "synonyms": "一路平安"
  },
  {
    "id": "4182",
    "chinese": "迷因",
    "synonyms": "模因"
  },
  {
    "id": "4187",
    "chinese": "明目张胆",
    "synonyms": "明火执仗"
  },
  {
    "id": "4209",
    "chinese": "闭口不言",
    "synonyms": "缄口不言;一言不发"
  },
  {
    "id": "4212",
    "chinese": "大同小异",
    "synonyms": "相差无几;大致相同"
  },
  {
    "id": "4220",
    "chinese": "口是心非",
    "synonyms": "心口不一;言不由衷"
  },
  {
    "id": "4255",
    "chinese": "最多",
    "synonyms": "至多"
  },
  {
    "id": "4267",
    "chinese": "耳屎",
    "synonyms": "耳垢"
  },
  {
    "id": "4277",
    "chinese": "吓人的",
    "synonyms": "可怕的;骇人的"
  },
  {
    "id": "4286",
    "chinese": "语气词",
    "synonyms": "语气助词"
  },
  {
    "id": "4287",
    "chinese": "航站楼",
    "synonyms": "航厦"
  },
  {
    "id": "4315",
    "chinese": "口疮",
    "synonyms": "口腔溃疡"
  },
  {
    "id": "4327",
    "chinese": "亲朋好友",
    "synonyms": "亲友"
  },
  {
    "id": "4367",
    "chinese": "治疗",
    "synonyms": "医治;诊治"
  },
  {
    "id": "4368",
    "chinese": "物理治疗",
    "synonyms": "物理疗法"
  },
  {
    "id": "4370",
    "chinese": "纹身",
    "synonyms": "文身;刺青"
  },
  {
    "id": "4498",
    "chinese": "官宣",
    "synonyms": "正式宣布"
  },
  {
    "id": "4548",
    "chinese": "掉线",
    "synonyms": "断线"
  },
  {
    "id": "4598",
    "chinese": "异常值",
    "synonyms": "离群值"
  },
  {
    "id": "4661",
    "chinese": "多因素认证",
    "synonyms": "多重因素认证"
  },
  {
    "id": "4681",
    "chinese": "拉勾",
    "synonyms": "拉钩"
  },
  {
    "id": "4682",
    "chinese": "一言为定",
    "synonyms": "说定了"
  },
  {
    "id": "4823",
    "chinese": "涤纶",
    "synonyms": "聚酯纤维"
  },
  {
    "id": "4849",
    "chinese": "气喘吁吁",
    "synonyms": "上气不接下气"
  },
  {
    "id": "4852",
    "chinese": "墨守成规",
    "synonyms": "因循守旧;墨守陈规"
  },
  {
    "id": "4881",
    "chinese": "光明正大",
    "synonyms": "正大光明"
  },
  {
    "id": "4884",
    "chinese": "草草了事",
    "synonyms": "敷衍了事;草草收场"
  },
  {
    "id": "4930",
    "chinese": "踏踏实实",
    "synonyms": "扎扎实实"
  },
  {
    "id": "4941",
    "chinese": "无缘无故",
    "synonyms": "无端;没来由"
  },
  {
    "id": "4942",
    "chinese": "打心眼里",
    "synonyms": "打心底里;发自内心"
  },
  {
    "id": "4950",
    "chinese": "扶梯",
    "synonyms": "自动扶梯"
  },
  {
    "id": "4951",
    "chinese": "直梯",
    "synonyms": "垂直电梯"
  },
  {
    "id": "5040",
    "chinese": "冒充者",
    "synonyms": "冒名顶替者"
  },
  {
    "id": "5126",
    "chinese": "饮料",
    "synonyms": "饮品"
  },
  {
    "id": "5199",
    "chinese": "储物柜",
    "synonyms": "储物橱"
  },
  {
    "id": "5277",
    "chinese": "放鸽子",
    "synonyms": "爽约"
  },
  {
    "id": "5322",
    "chinese": "品检",
    "synonyms": "品质检验;质量检验"
  },
  {
    "id": "5340",
    "chinese": "猫塔",
    "synonyms": "猫爬架"
  },
  {
    "id": "5343",
    "chinese": "打疫苗",
    "synonyms": "接种疫苗"
  },
  {
    "id": "5346",
    "chinese": "猫咖",
    "synonyms": "猫咪咖啡馆"
  },
  {
    "id": "5351",
    "chinese": "猫爬架",
    "synonyms": "猫塔"
  },
  {
    "id": "5357",
    "chinese": "粘人",
    "synonyms": "黏人"
  },
  {
    "id": "5441",
    "chinese": "订婚",
    "synonyms": "定亲"
  },
  {
    "id": "5467",
    "chinese": "签到",
    "synonyms": "报到"
  },
  {
    "id": "5485",
    "chinese": "普通外科",
    "synonyms": "普外科"
  },
  {
    "id": "5517",
    "chinese": "普内科",
    "synonyms": "普通内科"
  },
  {
    "id": "5532",
    "chinese": "服务台",
    "synonyms": "服务柜台"
  },
  {
    "id": "5543",
    "chinese": "输液",
    "synonyms": "打点滴"
  },
  {
    "id": "5544",
    "chinese": "注射",
    "synonyms": "打针"
  },
  {
    "id": "5562",
    "chinese": "天花板",
    "synonyms": "顶棚"
  },
  {
    "id": "5565",
    "chinese": "令人恐惧",
    "synonyms": "令人害怕"
  },
  {
    "id": "5569",
    "chinese": "待办事项清单",
    "synonyms": "待办清单"
  },
  {
    "id": "5588",
    "chinese": "变成",
    "synonyms": "变为"
  },
  {
    "id": "5600",
    "chinese": "睡着",
    "synonyms": "入睡"
  },
  {
    "id": "5608",
    "chinese": "脱掉",
    "synonyms": "脱下"
  },
  {
    "id": "5617",
    "chinese": "花光",
    "synonyms": "花完"
  },
  {
    "id": "5618",
    "chinese": "吃光",
    "synonyms": "吃完"
  },
  {
    "id": "5622",
    "chinese": "睡醒",
    "synonyms": "醒来"
  },
  {
    "id": "5646",
    "chinese": "长胖",
    "synonyms": "发胖;长肉"
  },
  {
    "id": "5656",
    "chinese": "三角恋情",
    "synonyms": "三角恋"
  },
  {
    "id": "5661",
    "chinese": "剧院",
    "synonyms": "剧场"
  },
  {
    "id": "5697",
    "chinese": "补习班",
    "synonyms": "辅导班"
  },
  {
    "id": "5706",
    "chinese": "光棍",
    "synonyms": "单身汉"
  },
  {
    "id": "5708",
    "chinese": "工地",
    "synonyms": "施工现场"
  },
  {
    "id": "5718",
    "chinese": "优惠券",
    "synonyms": "折扣券"
  },
  {
    "id": "5725",
    "chinese": "吃到饱",
    "synonyms": "不限量自助餐"
  },
  {
    "id": "5728",
    "chinese": "眼神接触",
    "synonyms": "目光接触"
  },
  {
    "id": "5730",
    "chinese": "实体店",
    "synonyms": "线下门店"
  },
  {
    "id": "5736",
    "chinese": "依偎",
    "synonyms": "偎依"
  },
  {
    "id": "5748",
    "chinese": "易拉罐",
    "synonyms": "拉环罐"
  },
  {
    "id": "5750",
    "chinese": "隧道",
    "synonyms": "隧洞"
  },
  {
    "id": "5797",
    "chinese": "甲壳虫",
    "synonyms": "甲虫"
  },
  {
    "id": "5808",
    "chinese": "屏保",
    "synonyms": "屏幕保护程序"
  },
  {
    "id": "5817",
    "chinese": "馍",
    "synonyms": "馒头"
  },
  {
    "id": "5854",
    "chinese": "整容",
    "synonyms": "整形美容"
  },
  {
    "id": "5869",
    "chinese": "伞",
    "synonyms": "雨伞"
  },
  {
    "id": "5943",
    "chinese": "对号",
    "synonyms": "勾号"
  },
  {
    "id": "5947",
    "chinese": "洗澡",
    "synonyms": "沐浴"
  },
  {
    "id": "5951",
    "chinese": "胶带",
    "synonyms": "胶布"
  },
  {
    "id": "5977",
    "chinese": "营销",
    "synonyms": "市场营销"
  },
  {
    "id": "5995",
    "chinese": "没戏",
    "synonyms": "没希望;没门儿"
  },
  {
    "id": "6021",
    "chinese": "烟民",
    "synonyms": "吸烟者"
  },
  {
    "id": "6035",
    "chinese": "放外音",
    "synonyms": "外放"
  },
  {
    "id": "6040",
    "chinese": "多管闲事",
    "synonyms": "管闲事"
  },
  {
    "id": "6041",
    "chinese": "大吵大闹",
    "synonyms": "吵吵闹闹"
  },
  {
    "id": "6194",
    "chinese": "全年无休",
    "synonyms": "全年营业"
  },
  {
    "id": "6223",
    "chinese": "上上星期",
    "synonyms": "上上周"
  },
  {
    "id": "6231",
    "chinese": "袖手旁观",
    "synonyms": "作壁上观;坐视不管"
  },
  {
    "id": "6242",
    "chinese": "春夏秋冬",
    "synonyms": "四季"
  },
  {
    "id": "6263",
    "chinese": "有声书",
    "synonyms": "有声读物"
  },
  {
    "id": "6288",
    "chinese": "捉迷藏",
    "synonyms": "躲猫猫"
  },
  {
    "id": "6301",
    "chinese": "高高在上",
    "synonyms": "居高临下"
  },
  {
    "id": "6405",
    "chinese": "男朋友",
    "synonyms": "男友"
  },
  {
    "id": "6406",
    "chinese": "女朋友",
    "synonyms": "女友"
  },
  {
    "id": "6440",
    "chinese": "破碎",
    "synonyms": "碎裂;破裂"
  },
  {
    "id": "6447",
    "chinese": "抛诸脑后",
    "synonyms": "置之脑后;忘却"
  },
  {
    "id": "6449",
    "chinese": "长椅",
    "synonyms": "长凳"
  },
  {
    "id": "6473",
    "chinese": "洗脸",
    "synonyms": "洁面"
  },
  {
    "id": "6896",
    "chinese": "安全检查",
    "synonyms": "安检"
  },
  {
    "id": "6911",
    "chinese": "剃刀",
    "synonyms": "剃须刀"
  },
  {
    "id": "6932",
    "chinese": "尽量",
    "synonyms": "尽可能"
  },
  {
    "id": "6960",
    "chinese": "标点符号",
    "synonyms": "标点"
  },
  {
    "id": "7229",
    "chinese": "渡轮",
    "synonyms": "轮渡"
  },
  {
    "id": "7286",
    "chinese": "鱼网",
    "synonyms": "渔网"
  },
  {
    "id": "7350",
    "chinese": "阖家幸福",
    "synonyms": "全家幸福"
  },
  {
    "id": "7357",
    "chinese": "暴饮暴食",
    "synonyms": "大吃大喝"
  },
  {
    "id": "7359",
    "chinese": "说脏话",
    "synonyms": "口出秽言"
  },
  {
    "id": "7472",
    "chinese": "道听途说",
    "synonyms": "道听途传"
  },
  {
    "id": "7476",
    "chinese": "老美",
    "synonyms": "美国人"
  },
  {
    "id": "7477",
    "chinese": "鸡蛋里头挑骨头",
    "synonyms": "吹毛求疵;鸡蛋里挑骨头"
  },
  {
    "id": "7478",
    "chinese": "扣除",
    "synonyms": "扣减;减去"
  },
  {
    "id": "7486",
    "chinese": "打耳光",
    "synonyms": "扇耳光;打嘴巴"
  },
  {
    "id": "7500",
    "chinese": "不对劲",
    "synonyms": "不正常;不对头"
  },
  {
    "id": "7542",
    "chinese": "人贩子",
    "synonyms": "人贩;人口贩子"
  },
  {
    "id": "7546",
    "chinese": "屋顶",
    "synonyms": "房顶"
  },
  {
    "id": "7575",
    "chinese": "玩具娃娃",
    "synonyms": "玩偶"
  },
  {
    "id": "7593",
    "chinese": "黏人",
    "synonyms": "粘人"
  },
  {
    "id": "7598",
    "chinese": "停电",
    "synonyms": "断电"
  },
  {
    "id": "7605",
    "chinese": "销声匿迹",
    "synonyms": "销声敛迹"
  },
  {
    "id": "7640",
    "chinese": "另有所图",
    "synonyms": "别有用心;另有企图"
  },
  {
    "id": "7653",
    "chinese": "肘部",
    "synonyms": "胳膊肘"
  },
  {
    "id": "7683",
    "chinese": "青旅",
    "synonyms": "青年旅舍"
  },
  {
    "id": "7686",
    "chinese": "泡沫塑料",
    "synonyms": "发泡塑料"
  },
  {
    "id": "7710",
    "chinese": "林荫道",
    "synonyms": "林阴道"
  },
  {
    "id": "7720",
    "chinese": "发帖人",
    "synonyms": "发帖者"
  },
  {
    "id": "7744",
    "chinese": "萝卜白菜各有所爱",
    "synonyms": "萝卜青菜各有所爱"
  },
  {
    "id": "7767",
    "chinese": "净水器",
    "synonyms": "净水机"
  },
  {
    "id": "7793",
    "chinese": "自动售卖机",
    "synonyms": "自动售货机"
  },
  {
    "id": "7831",
    "chinese": "奶制品",
    "synonyms": "乳制品"
  },
  {
    "id": "7846",
    "chinese": "一如既往",
    "synonyms": "始终如一"
  },
  {
    "id": "7847",
    "chinese": "趁虚而入",
    "synonyms": "乘虚而入"
  },
  {
    "id": "7863",
    "chinese": "天台",
    "synonyms": "屋顶平台"
  },
  {
    "id": "7870",
    "chinese": "食谱",
    "synonyms": "菜谱"
  },
  {
    "id": "7878",
    "chinese": "托儿所",
    "synonyms": "托育机构"
  },
  {
    "id": "7887",
    "chinese": "热衷于",
    "synonyms": "热心于;醉心于"
  },
  {
    "id": "7888",
    "chinese": "因祸得福",
    "synonyms": "转祸为福"
  },
  {
    "id": "7928",
    "chinese": "每时每刻",
    "synonyms": "时时刻刻"
  },
  {
    "id": "7938",
    "chinese": "过眼烟云",
    "synonyms": "过眼云烟"
  },
  {
    "id": "7952",
    "chinese": "坐以待毙",
    "synonyms": "束手待毙"
  },
  {
    "id": "7954",
    "chinese": "腥味",
    "synonyms": "腥气"
  },
  {
    "id": "7955",
    "chinese": "综艺",
    "synonyms": "综艺节目"
  },
  {
    "id": "7965",
    "chinese": "一动不动",
    "synonyms": "纹丝不动"
  },
  {
    "id": "7966",
    "chinese": "自查",
    "synonyms": "自我检查"
  },
  {
    "id": "7976",
    "chinese": "或多或少",
    "synonyms": "多多少少"
  },
  {
    "id": "7993",
    "chinese": "来之不易",
    "synonyms": "得来不易"
  },
  {
    "id": "8009",
    "chinese": "电磁炉",
    "synonyms": "电磁灶"
  },
  {
    "id": "8023",
    "chinese": "母语者",
    "synonyms": "母语使用者"
  },
  {
    "id": "8027",
    "chinese": "词汇库",
    "synonyms": "词库"
  },
  {
    "id": "8038",
    "chinese": "踩单车",
    "synonyms": "骑自行车"
  },
  {
    "id": "8043",
    "chinese": "电驴",
    "synonyms": "电动车"
  },
  {
    "id": "8048",
    "chinese": "店员",
    "synonyms": "售货员;营业员"
  },
  {
    "id": "8076",
    "chinese": "炉火纯青",
    "synonyms": "出神入化"
  },
  {
    "id": "8079",
    "chinese": "留言",
    "synonyms": "留话"
  },
  {
    "id": "8083",
    "chinese": "网暴",
    "synonyms": "网络暴力"
  },
  {
    "id": "8110",
    "chinese": "其中",
    "synonyms": "当中;之中"
  },
  {
    "id": "8111",
    "chinese": "代际差异",
    "synonyms": "代际差别"
  },
  {
    "id": "8125",
    "chinese": "交通方式",
    "synonyms": "出行方式"
  },
  {
    "id": "8142",
    "chinese": "身家",
    "synonyms": "家产"
  },
  {
    "id": "8153",
    "chinese": "搅拌",
    "synonyms": "搅和;搅动"
  },
  {
    "id": "8185",
    "chinese": "大喊大叫",
    "synonyms": "大呼小叫"
  },
  {
    "id": "8199",
    "chinese": "国有企业",
    "synonyms": "国企"
  },
  {
    "id": "8212",
    "chinese": "高管",
    "synonyms": "高级管理人员"
  },
  {
    "id": "8214",
    "chinese": "虚假宣传",
    "synonyms": "不实宣传"
  },
  {
    "id": "8229",
    "chinese": "浴缸",
    "synonyms": "浴盆"
  },
  {
    "id": "8257",
    "chinese": "职业高中",
    "synonyms": "职高"
  },
  {
    "id": "8258",
    "chinese": "开拓眼界",
    "synonyms": "开阔眼界"
  },
  {
    "id": "8259",
    "chinese": "大差不差",
    "synonyms": "差不多;大同小异"
  },
  {
    "id": "8263",
    "chinese": "口无遮拦",
    "synonyms": "口不择言"
  },
  {
    "id": "8271",
    "chinese": "孤陋寡闻",
    "synonyms": "见识浅陋"
  },
  {
    "id": "8273",
    "chinese": "长话短说",
    "synonyms": "简而言之"
  },
  {
    "id": "8277",
    "chinese": "变化莫测",
    "synonyms": "变幻莫测;变化无常"
  },
  {
    "id": "8288",
    "chinese": "光着脚",
    "synonyms": "赤脚;光脚"
  },
  {
    "id": "8289",
    "chinese": "碳水",
    "synonyms": "碳水化合物"
  },
  {
    "id": "8308",
    "chinese": "躲猫猫",
    "synonyms": "捉迷藏"
  },
  {
    "id": "8322",
    "chinese": "拇指",
    "synonyms": "大拇指"
  },
  {
    "id": "8331",
    "chinese": "嗤之以鼻",
    "synonyms": "不屑一顾"
  },
  {
    "id": "8336",
    "chinese": "形象生动",
    "synonyms": "生动形象"
  },
  {
    "id": "8351",
    "chinese": "老少咸宜",
    "synonyms": "老少皆宜"
  },
  {
    "id": "8353",
    "chinese": "赞不绝口",
    "synonyms": "赞口不绝;赞不绝声"
  },
  {
    "id": "8363",
    "chinese": "生动形象",
    "synonyms": "形象生动"
  },
  {
    "id": "8364",
    "chinese": "顺风顺水",
    "synonyms": "一帆风顺"
  },
  {
    "id": "8397",
    "chinese": "双层床",
    "synonyms": "上下铺;双层铺"
  },
  {
    "id": "8403",
    "chinese": "续费",
    "synonyms": "续交费用"
  },
  {
    "id": "8406",
    "chinese": "随身携带",
    "synonyms": "随身带着"
  },
  {
    "id": "8437",
    "chinese": "垃圾电话",
    "synonyms": "骚扰电话"
  },
  {
    "id": "8442",
    "chinese": "怕高",
    "synonyms": "恐高"
  },
  {
    "id": "8461",
    "chinese": "聊得来",
    "synonyms": "谈得来;合得来"
  },
  {
    "id": "8475",
    "chinese": "过气",
    "synonyms": "不再走红"
  },
  {
    "id": "8476",
    "chinese": "国际妇女节",
    "synonyms": "妇女节;三八妇女节"
  },
  {
    "id": "8480",
    "chinese": "骨子里",
    "synonyms": "骨子里面"
  },
  {
    "id": "8497",
    "chinese": "铺天盖地",
    "synonyms": "漫天遍地"
  },
  {
    "id": "8512",
    "chinese": "锒铛入狱",
    "synonyms": "锒铛下狱;身陷囹圄"
  },
  {
    "id": "8523",
    "chinese": "码农",
    "synonyms": "程序员"
  },
  {
    "id": "8529",
    "chinese": "平平无奇",
    "synonyms": "平淡无奇;平凡无奇"
  },
  {
    "id": "8553",
    "chinese": "答疑解惑",
    "synonyms": "解疑释惑"
  },
  {
    "id": "8554",
    "chinese": "大跌眼镜",
    "synonyms": "大出意料"
  },
  {
    "id": "8563",
    "chinese": "退烧药",
    "synonyms": "退热药"
  },
  {
    "id": "8569",
    "chinese": "吸烟区",
    "synonyms": "抽烟区"
  },
  {
    "id": "8590",
    "chinese": "活蹦乱跳",
    "synonyms": "生龙活虎"
  },
  {
    "id": "8618",
    "chinese": "下定决心",
    "synonyms": "打定主意;拿定主意"
  },
  {
    "id": "8653",
    "chinese": "背部",
    "synonyms": "后背"
  },
  {
    "id": "8658",
    "chinese": "滚开",
    "synonyms": "滚蛋;走开"
  },
  {
    "id": "8672",
    "chinese": "变通",
    "synonyms": "灵活处理"
  },
  {
    "id": "8702",
    "chinese": "小卖部",
    "synonyms": "小卖店"
  },
  {
    "id": "8708",
    "chinese": "演练",
    "synonyms": "排练;演习"
  },
  {
    "id": "8717",
    "chinese": "价保",
    "synonyms": "价格保护"
  },
  {
    "id": "8737",
    "chinese": "一窍不通",
    "synonyms": "一无所知"
  },
  {
    "id": "8761",
    "chinese": "榜单",
    "synonyms": "排行榜"
  },
  {
    "id": "8771",
    "chinese": "稀里糊涂",
    "synonyms": "糊里糊涂;迷迷糊糊"
  },
  {
    "id": "8772",
    "chinese": "自动取款机",
    "synonyms": "自动提款机;取款机"
  },
  {
    "id": "8781",
    "chinese": "开门见山",
    "synonyms": "直截了当"
  },
  {
    "id": "8791",
    "chinese": "朗朗上口",
    "synonyms": "琅琅上口"
  },
  {
    "id": "8792",
    "chinese": "拗口",
    "synonyms": "绕口"
  },
  {
    "id": "8822",
    "chinese": "除夕",
    "synonyms": "大年夜;年三十"
  },
  {
    "id": "8893",
    "chinese": "美食沙漠",
    "synonyms": "美食荒漠"
  },
  {
    "id": "8916",
    "chinese": "关停",
    "synonyms": "关闭;停止运营"
  },
  {
    "id": "8950",
    "chinese": "词性",
    "synonyms": "词类"
  },
  {
    "id": "8972",
    "chinese": "无药可救",
    "synonyms": "不可救药"
  },
  {
    "id": "8976",
    "chinese": "时令",
    "synonyms": "季节"
  },
  {
    "id": "8977",
    "chinese": "当季",
    "synonyms": "应季"
  },
  {
    "id": "8978",
    "chinese": "应季",
    "synonyms": "当季"
  },
  {
    "id": "8985",
    "chinese": "老城区",
    "synonyms": "旧城区"
  },
  {
    "id": "9037",
    "chinese": "悄悄话",
    "synonyms": "耳语"
  },
  {
    "id": "9046",
    "chinese": "副驾驶",
    "synonyms": "副驾"
  },
  {
    "id": "9063",
    "chinese": "崴脚",
    "synonyms": "扭伤脚踝"
  },
  {
    "id": "9066",
    "chinese": "亏钱",
    "synonyms": "赔钱;亏本"
  },
  {
    "id": "9081",
    "chinese": "言外之意",
    "synonyms": "弦外之音;话外之意"
  },
  {
    "id": "9085",
    "chinese": "女票",
    "synonyms": "女朋友;女友"
  },
  {
    "id": "9086",
    "chinese": "男票",
    "synonyms": "男朋友;男友"
  },
  {
    "id": "9096",
    "chinese": "外貌",
    "synonyms": "容貌;相貌"
  },
  {
    "id": "9097",
    "chinese": "廉航",
    "synonyms": "廉价航空"
  },
  {
    "id": "9101",
    "chinese": "卡壳",
    "synonyms": "卡住"
  },
  {
    "id": "9109",
    "chinese": "有秩序",
    "synonyms": "有序"
  },
  {
    "id": "9134",
    "chinese": "急躁",
    "synonyms": "焦躁"
  },
  {
    "id": "9138",
    "chinese": "粗心大意",
    "synonyms": "粗枝大叶;马马虎虎"
  },
  {
    "id": "9143",
    "chinese": "忍不住",
    "synonyms": "禁不住;不由得"
  },
  {
    "id": "9151",
    "chinese": "互删",
    "synonyms": "互相删除"
  },
  {
    "id": "9160",
    "chinese": "反话",
    "synonyms": "反语"
  },
  {
    "id": "9165",
    "chinese": "沙排",
    "synonyms": "沙滩排球"
  },
  {
    "id": "9173",
    "chinese": "茅坑",
    "synonyms": "茅厕"
  },
  {
    "id": "9176",
    "chinese": "背包旅行",
    "synonyms": "背包旅游"
  },
  {
    "id": "9178",
    "chinese": "好兆头",
    "synonyms": "好预兆;吉兆"
  },
  {
    "id": "9191",
    "chinese": "合得来",
    "synonyms": "谈得来;处得来"
  },
  {
    "id": "9192",
    "chinese": "合不来",
    "synonyms": "处不来;不投缘"
  },
  {
    "id": "9195",
    "chinese": "遥远",
    "synonyms": "辽远"
  },
  {
    "id": "9196",
    "chinese": "始终如一",
    "synonyms": "始终不渝;一如既往"
  },
  {
    "id": "9201",
    "chinese": "匆匆忙忙",
    "synonyms": "急急忙忙;匆匆促促"
  },
  {
    "id": "9208",
    "chinese": "循规蹈矩",
    "synonyms": "规行矩步;按部就班"
  },
  {
    "id": "9209",
    "chinese": "课本",
    "synonyms": "教科书"
  },
  {
    "id": "9210",
    "chinese": "皱眉头",
    "synonyms": "皱眉"
  }
]
$synonyms$::jsonb) AS e(id text, chinese text, synonyms text)
)
UPDATE public.study_content AS content
SET payload = content.payload || jsonb_build_object('synonym(s)', additions.synonyms),
    updated_at = now()
FROM additions
WHERE content.id = 'word:' || additions.id
  AND content.kind = 'word'
  AND content.payload->>'chinese' = additions.chinese
  AND coalesce(btrim(content.payload->>'synonym(s)'), '') IN ('', '-')
RETURNING content.id, content.payload->>'chinese' AS chinese,
          content.payload->>'synonym(s)' AS synonyms;
COMMIT;
