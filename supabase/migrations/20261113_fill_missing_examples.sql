-- Fill 219 missing example triples. Run in the Supabase SQL Editor.
-- Existing examples and mismatched Chinese headwords are preserved. Safe to rerun.
-- Only example fields and updated_at change; user progress is untouched.
BEGIN;
WITH examples AS (
  SELECT * FROM jsonb_to_recordset($examples$
[
  {
    "id": "702",
    "chinese": "随身的行李",
    "sentence": "随身的行李请放在座位上方的行李架上。",
    "sentence_pinyin": "Suí shēn de xíng lǐ qǐng fàng zài zuò wèi shàng fāng de xíng lǐ jià shàng.",
    "sentence_english": "Please put your carry-on luggage on the rack above your seat."
  },
  {
    "id": "1504",
    "chinese": "六幺八",
    "sentence": "六幺八快到了，我想等打折的时候再买电脑。",
    "sentence_pinyin": "Liù yāo bā kuài dào le, wǒ xiǎng děng dǎ zhé de shí hòu zài mǎi diàn nǎo.",
    "sentence_english": "The June 18 shopping festival is coming, so I want to wait for a discount before buying a computer."
  },
  {
    "id": "1747",
    "chinese": "己所不欲勿施于人",
    "sentence": "己所不欲，勿施于人，你不喜欢被打断，也别打断别人。",
    "sentence_pinyin": "Jǐ suǒ bù yù, wù shī yú rén, nǐ bù xǐ huān bèi dǎ duàn, yě bié dǎ duàn bié rén.",
    "sentence_english": "Do not do to others what you would not want done to yourself: if you dislike being interrupted, do not interrupt others either."
  },
  {
    "id": "1751",
    "chinese": "饭来张口衣来伸手",
    "sentence": "他从小饭来张口，衣来伸手，搬出去以后才开始学做饭。",
    "sentence_pinyin": "Tā cóng xiǎo fàn lái zhāng kǒu, yī lái shēn shǒu, bān chū qù yǐ hòu cái kāi shǐ xué zuò fàn.",
    "sentence_english": "He had everything done for him growing up and only started learning to cook after moving out."
  },
  {
    "id": "1754",
    "chinese": "君子报仇十年不晚",
    "sentence": "他用“君子报仇，十年不晚”安慰自己，决定先冷静下来。",
    "sentence_pinyin": "Tā yòng “jūn zǐ bào chóu, shí nián bù wǎn” ān wèi zì jǐ, jué dìng xiān lěng jìng xià lái.",
    "sentence_english": "He comforted himself with the saying that revenge can wait and decided to calm down first."
  },
  {
    "id": "1756",
    "chinese": "富强 民主 文明",
    "sentence": "这面墙上写着“富强、民主、文明”几个大字。",
    "sentence_pinyin": "Zhè miàn qiáng shàng xiě zhe “fù qiáng, mín zhǔ, wén míng” jǐ gè dà zì.",
    "sentence_english": "The words “prosperity, democracy, and civilization” are written in large characters on this wall."
  },
  {
    "id": "1757",
    "chinese": "和谐 自由 平等",
    "sentence": "老师请我们讨论“和谐、自由、平等”分别是什么意思。",
    "sentence_pinyin": "Lǎo shī qǐng wǒ men tǎo lùn “hé xié, zì yóu, píng děng” fēn bié shì shén me yì si.",
    "sentence_english": "The teacher asked us to discuss what “harmony, freedom, and equality” each mean."
  },
  {
    "id": "1758",
    "chinese": "公正 法治 爱国",
    "sentence": "海报上的“公正、法治、爱国”引起了他的注意。",
    "sentence_pinyin": "Hǎi bào shàng de “gōng zhèng, fǎ zhì, ài guó” yǐn qǐ le tā de zhù yì.",
    "sentence_english": "The words “justice, rule of law, and patriotism” on the poster caught his attention."
  },
  {
    "id": "1759",
    "chinese": "敬业 诚信 友善",
    "sentence": "公司希望员工做到敬业、诚信、友善。",
    "sentence_pinyin": "Gōng sī xī wàng yuán gōng zuò dào jìng yè, chéng xìn, yǒu shàn.",
    "sentence_english": "The company hopes its employees will show dedication, integrity, and friendliness."
  },
  {
    "id": "1782",
    "chinese": "由于天气原因",
    "sentence": "由于天气原因，今天的户外活动取消了。",
    "sentence_pinyin": "Yóu yú tiān qì yuán yīn, jīn tiān de hù wài huó dòng qǔ xiāo le.",
    "sentence_english": "Today's outdoor activities have been canceled because of the weather."
  },
  {
    "id": "1785",
    "chinese": "不太适合打羽毛球",
    "sentence": "这里风太大，不太适合打羽毛球。",
    "sentence_pinyin": "Zhè lǐ fēng tài dà, bù tài shì hé dǎ yǔ máo qiú.",
    "sentence_english": "It is too windy here to play badminton comfortably."
  },
  {
    "id": "1897",
    "chinese": "草莓牛乳",
    "sentence": "这杯草莓牛乳有点甜，下次我想少放一点糖。",
    "sentence_pinyin": "Zhè bēi cǎo méi niú rǔ yǒu diǎn tián, xià cì wǒ xiǎng shǎo fàng yī diǎn táng.",
    "sentence_english": "This strawberry milk is a little sweet; next time I would like less sugar."
  },
  {
    "id": "1898",
    "chinese": "葡萄椰椰",
    "sentence": "我点了一杯葡萄椰椰，想尝尝葡萄和椰子的搭配。",
    "sentence_pinyin": "Wǒ diǎn le yī bēi pú táo yē yē, xiǎng cháng cháng pú táo hé yē zi de dā pèi.",
    "sentence_english": "I ordered a grape-and-coconut drink to try the combination of grape and coconut."
  },
  {
    "id": "1899",
    "chinese": "超厚芋泥奶绿",
    "sentence": "这杯超厚芋泥奶绿里的芋泥很多，喝之前要搅一搅。",
    "sentence_pinyin": "Zhè bēi chāo hòu yù ní nǎi lǜ lǐ de yù ní hěn duō, hē zhī qián yào jiǎo yī jiǎo.",
    "sentence_english": "This green milk tea has lots of thick taro paste, so stir it before drinking."
  },
  {
    "id": "1900",
    "chinese": "薄荷奶绿",
    "sentence": "天气太热了，我想喝一杯冰的薄荷奶绿。",
    "sentence_pinyin": "Tiān qì tài rè le, wǒ xiǎng hē yī bēi bīng de bò hé nǎi lǜ.",
    "sentence_english": "It is so hot that I would like an iced mint green milk tea."
  },
  {
    "id": "1901",
    "chinese": "芒芒火龙果酸奶",
    "sentence": "她点了芒芒火龙果酸奶，还特意问了里面有没有糖。",
    "sentence_pinyin": "Tā diǎn le máng máng huǒ lóng guǒ suān nǎi, hái tè yì wèn le lǐ miàn yǒu méi yǒu táng.",
    "sentence_english": "She ordered the mango and dragon fruit yogurt and specifically asked whether it contained sugar."
  },
  {
    "id": "1902",
    "chinese": "茉香奶绿典",
    "sentence": "菜单上的“茉香奶绿典”听起来不错，我想点一杯试试。",
    "sentence_pinyin": "Cài dān shàng de “mò xiāng nǎi lǜ diǎn” tīng qǐ lái bù cuò, wǒ xiǎng diǎn yī bēi shì shì.",
    "sentence_english": "The menu item called “Jasmine Green Milk Tea Classic” sounds good; I would like to try a cup."
  },
  {
    "id": "1906",
    "chinese": "蜂蜜柚子茶",
    "sentence": "我嗓子不太舒服，想喝点温的蜂蜜柚子茶。",
    "sentence_pinyin": "Wǒ sǎng zi bù tài shū fú, xiǎng hē diǎn wēn de fēng mì yòu zi chá.",
    "sentence_english": "My throat feels a little uncomfortable, so I would like some warm honey pomelo tea."
  },
  {
    "id": "1907",
    "chinese": "茉莉香椰",
    "sentence": "这家店的茉莉香椰有淡淡的茉莉花香。",
    "sentence_pinyin": "Zhè jiā diàn de mò lì xiāng yē yǒu dàn dàn de mò lì huā xiāng.",
    "sentence_english": "This shop's jasmine coconut drink has a delicate jasmine fragrance."
  },
  {
    "id": "1908",
    "chinese": "鲜萃茗茶",
    "sentence": "如果你不喜欢奶茶，可以选鲜萃茗茶。",
    "sentence_pinyin": "Rú guǒ nǐ bù xǐ huān nǎi chá, kě yǐ xuǎn xiān cuì míng chá.",
    "sentence_english": "If you do not like milk tea, you can choose freshly brewed tea."
  },
  {
    "id": "1909",
    "chinese": "现磨咖啡",
    "sentence": "这家店的现磨咖啡比便利店的罐装咖啡贵一点。",
    "sentence_pinyin": "Zhè jiā diàn de xiàn mó kā fēi bǐ biàn lì diàn de guàn zhuāng kā fēi guì yī diǎn.",
    "sentence_english": "This shop's freshly ground coffee costs a little more than canned coffee from a convenience store."
  },
  {
    "id": "1910",
    "chinese": "生酪拿铁",
    "sentence": "生酪拿铁的奶味很浓，我喝半杯就觉得够了。",
    "sentence_pinyin": "Shēng lào ná tiě de nǎi wèi hěn nóng, wǒ hē bàn bēi jiù jué de gòu le.",
    "sentence_english": "The creamy cheese latte tastes very milky; half a cup is enough for me."
  },
  {
    "id": "1916",
    "chinese": "紫米绵绵糕",
    "sentence": "我买了两块紫米绵绵糕，准备带回去和朋友分着吃。",
    "sentence_pinyin": "Wǒ mǎi le liǎng kuài zǐ mǐ mián mián gāo, zhǔn bèi dài huí qù hé péng yǒu fēn zhe chī.",
    "sentence_english": "I bought two pieces of soft purple rice cake to take back and share with a friend."
  },
  {
    "id": "1920",
    "chinese": "混搭糕",
    "sentence": "这份混搭糕有几种不同的口味，适合两个人一起吃。",
    "sentence_pinyin": "Zhè fèn hùn dā gāo yǒu jǐ zhǒng bù tóng de kǒu wèi, shì hé liǎng gè rén yī qǐ chī.",
    "sentence_english": "This mixed cake selection comes in several flavors and is good for two people to share."
  },
  {
    "id": "1923",
    "chinese": "香酥鸡蛋汉堡",
    "sentence": "刚出锅的香酥鸡蛋汉堡很烫，吃的时候小心一点。",
    "sentence_pinyin": "Gāng chū guō de xiāng sū jī dàn hàn bǎo hěn tàng, chī de shí hòu xiǎo xīn yī diǎn.",
    "sentence_english": "The crispy egg burger is hot straight off the griddle, so be careful when eating it."
  },
  {
    "id": "1924",
    "chinese": "萧县卷凉皮",
    "sentence": "这份萧县卷凉皮能不能少放一点辣椒？",
    "sentence_pinyin": "Zhè fèn xiāo xiàn juǎn liáng pí néng bù néng shǎo fàng yī diǎn là jiāo?",
    "sentence_english": "Could you put a little less chili in this Xiaoxian cold-noodle wrap?"
  },
  {
    "id": "1925",
    "chinese": "功夫卷饼",
    "sentence": "我中午买了一个功夫卷饼，边走边吃。",
    "sentence_pinyin": "Wǒ zhōng wǔ mǎi le yī gè gōng fu juǎn bǐng, biān zǒu biān chī.",
    "sentence_english": "I bought a Kung Fu wrap for lunch and ate it while walking."
  },
  {
    "id": "1931",
    "chinese": "麻辣鸭肠卷",
    "sentence": "他喜欢吃辣，所以选了麻辣鸭肠卷。",
    "sentence_pinyin": "Tā xǐ huān chī là, suǒ yǐ xuǎn le má là yā cháng juǎn.",
    "sentence_english": "He likes spicy food, so he chose a spicy duck-intestine wrap."
  },
  {
    "id": "1934",
    "chinese": "五香牛肉",
    "sentence": "这盘五香牛肉切得很薄，适合配米饭吃。",
    "sentence_pinyin": "Zhè pán wǔ xiāng niú ròu qiē de hěn báo, shì hé pèi mǐ fàn chī.",
    "sentence_english": "This five-spice beef is sliced thinly and goes well with rice."
  },
  {
    "id": "1939",
    "chinese": "五花卤肉",
    "sentence": "五花卤肉有点肥，我想配一盘青菜。",
    "sentence_pinyin": "Wǔ huā lǔ ròu yǒu diǎn féi, wǒ xiǎng pèi yī pán qīng cài.",
    "sentence_english": "The braised pork belly is a little fatty, so I would like a plate of vegetables with it."
  },
  {
    "id": "1940",
    "chinese": "粢饭团",
    "sentence": "我早上买了一个粢饭团，里面加了油条。",
    "sentence_pinyin": "Wǒ zǎo shàng mǎi le yī gè cí fàn tuán, lǐ miàn jiā le yóu tiáo.",
    "sentence_english": "I bought a glutinous rice roll with a fried dough stick inside for breakfast."
  },
  {
    "id": "1941",
    "chinese": "奥尔良鸡腿肉",
    "sentence": "这份奥尔良鸡腿肉可以单点，也可以加在饭里。",
    "sentence_pinyin": "Zhè fèn ào ěr liáng jī tuǐ ròu kě yǐ dān diǎn, yě kě yǐ jiā zài fàn lǐ.",
    "sentence_english": "You can order this Orleans-style chicken thigh separately or add it to rice."
  },
  {
    "id": "1942",
    "chinese": "爆炒肉沫",
    "sentence": "这份爆炒肉沫很下饭，我又添了一碗米饭。",
    "sentence_pinyin": "Zhè fèn bào chǎo ròu mò hěn xià fàn, wǒ yòu tiān le yī wǎn mǐ fàn.",
    "sentence_english": "This stir-fried minced meat goes so well with rice that I had another bowl."
  },
  {
    "id": "1943",
    "chinese": "粉酸笋",
    "sentence": "菜单上写着“粉酸笋”，我问店员这道菜里有什么。",
    "sentence_pinyin": "Cài dān shàng xiě zhe “fěn suān sǔn”, wǒ wèn diàn yuán zhè dào cài lǐ yǒu shén me.",
    "sentence_english": "The menu said “粉酸笋,” so I asked the server what was in the dish."
  },
  {
    "id": "1944",
    "chinese": "武夷山鲜笋",
    "sentence": "我们点了一盘武夷山鲜笋，想尝尝当地的食材。",
    "sentence_pinyin": "Wǒ men diǎn le yī pán wǔ yí shān xiān sǔn, xiǎng cháng cháng dāng dì de shí cái.",
    "sentence_english": "We ordered a plate of fresh bamboo shoots from Wuyi Mountain to try a local ingredient."
  },
  {
    "id": "1945",
    "chinese": "肉花肠",
    "sentence": "老板把肉花肠切成小段，装进了纸盒里。",
    "sentence_pinyin": "Lǎo bǎn bǎ ròu huā cháng qiē chéng xiǎo duàn, zhuāng jìn le zhǐ hé lǐ.",
    "sentence_english": "The vendor cut the pork sausage into small pieces and put them in a paper box."
  },
  {
    "id": "1946",
    "chinese": "玉米肠",
    "sentence": "这个饭团可以加玉米肠，也可以加火腿肠。",
    "sentence_pinyin": "Zhè ge fàn tuán kě yǐ jiā yù mǐ cháng, yě kě yǐ jiā huǒ tuǐ cháng.",
    "sentence_english": "You can add a corn sausage or a ham sausage to this rice roll."
  },
  {
    "id": "1948",
    "chinese": "王中王火腿肠",
    "sentence": "我买了一包王中王火腿肠，准备坐火车时吃。",
    "sentence_pinyin": "Wǒ mǎi le yī bāo wáng zhōng wáng huǒ tuǐ cháng, zhǔn bèi zuò huǒ chē shí chī.",
    "sentence_english": "I bought a pack of King of Kings ham sausages to eat on the train."
  },
  {
    "id": "1949",
    "chinese": "咸鸭蛋",
    "sentence": "咸鸭蛋已经很咸了，这碗粥不用再加盐。",
    "sentence_pinyin": "Xián yā dàn yǐ jīng hěn xián le, zhè wǎn zhōu bù yòng zài jiā yán.",
    "sentence_english": "The salted duck egg is already very salty, so there is no need to add salt to this porridge."
  },
  {
    "id": "1962",
    "chinese": "腊味蛋炒饭",
    "sentence": "这份腊味蛋炒饭里有腊肠，香味很浓。",
    "sentence_pinyin": "Zhè fèn là wèi dàn chǎo fàn lǐ yǒu là cháng, xiāng wèi hěn nóng.",
    "sentence_english": "This preserved-meat egg fried rice contains Chinese sausage and has a rich aroma."
  },
  {
    "id": "1963",
    "chinese": "招牌荷花酥",
    "sentence": "服务员推荐了招牌荷花酥，说这是店里很受欢迎的点心。",
    "sentence_pinyin": "Fú wù yuán tuī jiàn le zhāo pái hé huā sū, shuō zhè shì diàn lǐ hěn shòu huān yíng de diǎn xīn.",
    "sentence_english": "The server recommended the signature lotus-shaped pastry, saying it was a popular snack at the shop."
  },
  {
    "id": "1964",
    "chinese": "红糖冰粉",
    "sentence": "吃完辣的东西以后，我想来一碗红糖冰粉。",
    "sentence_pinyin": "Chī wán là de dōng xī yǐ hòu, wǒ xiǎng lái yī wǎn hóng táng bīng fěn.",
    "sentence_english": "After eating spicy food, I would like a bowl of chilled jelly with brown sugar syrup."
  },
  {
    "id": "1965",
    "chinese": "百香柠檬茶",
    "sentence": "这杯百香柠檬茶有点酸，能加一点蜂蜜吗？",
    "sentence_pinyin": "Zhè bēi bǎi xiāng níng méng chá yǒu diǎn suān, néng jiā yī diǎn fēng mì ma?",
    "sentence_english": "This passion fruit lemon tea is a little sour; could you add some honey?"
  },
  {
    "id": "1967",
    "chinese": "葱油生菜",
    "sentence": "我们已经点了两道肉菜，再加一份葱油生菜吧。",
    "sentence_pinyin": "Wǒ men yǐ jīng diǎn le liǎng dào ròu cài, zài jiā yī fèn cōng yóu shēng cài ba.",
    "sentence_english": "We have already ordered two meat dishes; let's add some lettuce with scallion oil."
  },
  {
    "id": "1968",
    "chinese": "干菜刀豆",
    "sentence": "我第一次点干菜刀豆，想知道它是不是很咸。",
    "sentence_pinyin": "Wǒ dì yī cì diǎn gān cài dāo dòu, xiǎng zhī dào tā shì bù shì hěn xián.",
    "sentence_english": "It is my first time ordering sword beans with dried preserved vegetables, and I wonder whether they are very salty."
  },
  {
    "id": "1969",
    "chinese": "干煸花菜",
    "sentence": "干煸花菜要趁热吃，凉了以后口感就不一样了。",
    "sentence_pinyin": "Gān biān huā cài yào chèn rè chī, liáng le yǐ hòu kǒu gǎn jiù bù yī yàng le.",
    "sentence_english": "Eat the dry-fried cauliflower while it is hot; its texture changes once it cools."
  },
  {
    "id": "1970",
    "chinese": "酱爆茄子",
    "sentence": "这道酱爆茄子做得很软，我奶奶也吃得动。",
    "sentence_pinyin": "Zhè dào jiàng bào qié zi zuò de hěn ruǎn, wǒ nǎi nǎi yě chī de dòng.",
    "sentence_english": "This sauce-fried eggplant is very soft, so even my grandmother can eat it easily."
  },
  {
    "id": "1976",
    "chinese": "气致冰美式",
    "sentence": "我没喝过菜单上的“气致冰美式”，先问问店员它是什么口味。",
    "sentence_pinyin": "Wǒ méi hē guò cài dān shàng de “qì zhì bīng měi shì”, xiān wèn wèn diàn yuán tā shì shén me kǒu wèi.",
    "sentence_english": "I have never tried the menu's “气致冰美式,” so I will ask the server what it tastes like first."
  },
  {
    "id": "1978",
    "chinese": "威士忌冰美式",
    "sentence": "我下午还要开车，就不点威士忌冰美式了。",
    "sentence_pinyin": "Wǒ xià wǔ hái yào kāi chē, jiù bù diǎn wēi shì jì bīng měi shì le.",
    "sentence_english": "I still have to drive this afternoon, so I will not order the whiskey iced Americano."
  },
  {
    "id": "1979",
    "chinese": "焦糖拿铁",
    "sentence": "这杯焦糖拿铁太甜了，下次请少放一点焦糖。",
    "sentence_pinyin": "Zhè bēi jiāo táng ná tiě tài tián le, xià cì qǐng shǎo fàng yī diǎn jiāo táng.",
    "sentence_english": "This caramel latte is too sweet; please use less caramel next time."
  },
  {
    "id": "1980",
    "chinese": "桂花拿铁",
    "sentence": "秋天的时候，这家咖啡店会推出桂花拿铁。",
    "sentence_pinyin": "Qiū tiān de shí hòu, zhè jiā kā fēi diàn huì tuī chū guì huā ná tiě.",
    "sentence_english": "In autumn, this cafe offers an osmanthus latte."
  },
  {
    "id": "1981",
    "chinese": "冲绳黑糖拿铁",
    "sentence": "她喜欢冲绳黑糖拿铁，但觉得大杯喝不完。",
    "sentence_pinyin": "Tā xǐ huān chōng shéng hēi táng ná tiě, dàn jué de dà bēi hē bù wán.",
    "sentence_english": "She likes the Okinawa brown sugar latte but thinks she cannot finish a large cup."
  },
  {
    "id": "1982",
    "chinese": "绿豆沙沙拿铁",
    "sentence": "我想试试绿豆沙沙拿铁，看看绿豆和咖啡搭不搭。",
    "sentence_pinyin": "Wǒ xiǎng shì shì lǜ dòu shā shā ná tiě, kàn kàn lǜ dòu hé kā fēi dā bù dā.",
    "sentence_english": "I would like to try the mung bean slush latte to see whether mung bean and coffee go well together."
  },
  {
    "id": "1987",
    "chinese": "手工蛋糕",
    "sentence": "这家店的手工蛋糕每天只做十个，最好提前预订。",
    "sentence_pinyin": "Zhè jiā diàn de shǒu gōng dàn gāo měi tiān zhǐ zuò shí gè, zuì hǎo tí qián yù dìng.",
    "sentence_english": "This shop makes only ten handmade cakes a day, so it is best to order ahead."
  },
  {
    "id": "1990",
    "chinese": "蛋黄肉粽子",
    "sentence": "这个蛋黄肉粽子很大，一个就够我吃了。",
    "sentence_pinyin": "Zhè ge dàn huáng ròu zòng zi hěn dà, yī gè jiù gòu wǒ chī le.",
    "sentence_english": "This pork and egg-yolk rice dumpling is large; one is enough for me."
  },
  {
    "id": "1991",
    "chinese": "红赤豆",
    "sentence": "煮粥之前，先把红赤豆洗干净。",
    "sentence_pinyin": "Zhǔ zhōu zhī qián, xiān bǎ hóng chì dòu xǐ gān jìng.",
    "sentence_english": "Wash the red adzuki beans before cooking the porridge."
  },
  {
    "id": "1995",
    "chinese": "豆制品类",
    "sentence": "如果你不吃肉，可以看看菜单上的豆制品类。",
    "sentence_pinyin": "Rú guǒ nǐ bù chī ròu, kě yǐ kàn kàn cài dān shàng de dòu zhì pǐn lèi.",
    "sentence_english": "If you do not eat meat, you can look at the soy products section of the menu."
  },
  {
    "id": "1996",
    "chinese": "肉类",
    "sentence": "生的肉类要和可以直接吃的食物分开放。",
    "sentence_pinyin": "Shēng de ròu lèi yào hé kě yǐ zhí jiē chī de shí wù fēn kāi fàng.",
    "sentence_english": "Keep raw meat separate from food that is ready to eat."
  },
  {
    "id": "1997",
    "chinese": "冰鲜丸子",
    "sentence": "这些冰鲜丸子要放在冰箱里，不能一直放在桌上。",
    "sentence_pinyin": "Zhè xiē bīng xiān wán zi yào fàng zài bīng xiāng lǐ, bù néng yī zhí fàng zài zhuō shàng.",
    "sentence_english": "These chilled meatballs need to be kept in the fridge, not left on the table."
  },
  {
    "id": "2005",
    "chinese": "牛排拌面",
    "sentence": "牛排拌面上桌以后，先把酱汁拌匀再吃。",
    "sentence_pinyin": "Niú pái bàn miàn shàng zhuō yǐ hòu, xiān bǎ jiàng zhī bàn yún zài chī.",
    "sentence_english": "Once the steak noodles arrive, mix in the sauce evenly before eating."
  },
  {
    "id": "2006",
    "chinese": "安格斯肥牛饭",
    "sentence": "我点了一份安格斯肥牛饭，还加了一个煎蛋。",
    "sentence_pinyin": "Wǒ diǎn le yī fèn ān gé sī féi niú fàn, hái jiā le yī gè jiān dàn.",
    "sentence_english": "I ordered rice with thinly sliced Angus beef and added a fried egg."
  },
  {
    "id": "2007",
    "chinese": "牛骨头汤面",
    "sentence": "天气冷的时候，喝一碗牛骨头汤面的汤很舒服。",
    "sentence_pinyin": "Tiān qì lěng de shí hòu, hē yī wǎn niú gǔ tou tāng miàn de tāng hěn shū fú.",
    "sentence_english": "When it is cold, the broth from a bowl of beef-bone noodle soup is comforting."
  },
  {
    "id": "2008",
    "chinese": "秘制牛排",
    "sentence": "这家店的秘制牛排要等二十分钟才能做好。",
    "sentence_pinyin": "Zhè jiā diàn de mì zhì niú pái yào děng èr shí fēn zhōng cái néng zuò hǎo.",
    "sentence_english": "This restaurant's house-special steak takes twenty minutes to prepare."
  },
  {
    "id": "2009",
    "chinese": "牛筋牛肚粗粉",
    "sentence": "他点了牛筋牛肚粗粉，特意说不要香菜。",
    "sentence_pinyin": "Tā diǎn le niú jīn niú dǔ cū fěn, tè yì shuō bù yào xiāng cài.",
    "sentence_english": "He ordered thick noodles with beef tendon and tripe and specifically asked for no cilantro."
  },
  {
    "id": "2010",
    "chinese": "牛肉丸米线",
    "sentence": "这碗牛肉丸米线里的米线很滑，用筷子不太好夹。",
    "sentence_pinyin": "Zhè wǎn niú ròu wán mǐ xiàn lǐ de mǐ xiàn hěn huá, yòng kuài zi bù tài hǎo jiā.",
    "sentence_english": "The rice noodles in this beef-ball soup are slippery and rather hard to pick up with chopsticks."
  },
  {
    "id": "2011",
    "chinese": "牛排+咸饭",
    "sentence": "菜单上有“牛排加咸饭”的套餐，比单点便宜。",
    "sentence_pinyin": "Cài dān shàng yǒu “niú pái jiā xián fàn” de tào cān, bǐ dān diǎn pián yi.",
    "sentence_english": "The menu has a steak-and-savory-rice set that is cheaper than ordering separately."
  },
  {
    "id": "2012",
    "chinese": "特色牛杂汤",
    "sentence": "这碗特色牛杂汤的分量不小，我们两个人可以分着喝。",
    "sentence_pinyin": "Zhè wǎn tè sè niú zá tāng de fèn liàng bù xiǎo, wǒ men liǎng gè rén kě yǐ fēn zhe hē.",
    "sentence_english": "This house-special beef offal soup is a generous serving; the two of us can share it."
  },
  {
    "id": "2013",
    "chinese": "私房拌面",
    "sentence": "老板推荐私房拌面，说酱汁是每天现做的。",
    "sentence_pinyin": "Lǎo bǎn tuī jiàn sī fáng bàn miàn, shuō jiàng zhī shì měi tiān xiàn zuò de.",
    "sentence_english": "The owner recommended the house-style mixed noodles, saying the sauce is made fresh daily."
  },
  {
    "id": "2014",
    "chinese": "闽南牛肉",
    "sentence": "我们到福建以后，想找家店尝尝闽南牛肉。",
    "sentence_pinyin": "Wǒ men dào fú jiàn yǐ hòu, xiǎng zhǎo jiā diàn cháng cháng mǐn nán niú ròu.",
    "sentence_english": "After arriving in Fujian, we want to find a restaurant to try southern Fujian beef."
  },
  {
    "id": "2015",
    "chinese": "12道工序 古法制面",
    "sentence": "店门口写着“十二道工序，古法制面”，吸引了不少顾客。",
    "sentence_pinyin": "Diàn mén kǒu xiě zhe “shí èr dào gōng xù, gǔ fǎ zhì miàn”, xī yǐn le bù shǎo gù kè.",
    "sentence_english": "The sign outside says “Twelve steps, traditionally made noodles,” attracting quite a few customers."
  },
  {
    "id": "2016",
    "chinese": "手打牛肉丸",
    "sentence": "这些手打牛肉丸很有弹性，煮汤和涮火锅都合适。",
    "sentence_pinyin": "Zhè xiē shǒu dǎ niú ròu wán hěn yǒu tán xìng, zhǔ tāng hé shuàn huǒ guō dōu hé shì.",
    "sentence_english": "These handmade beef balls are springy and work well in soup or hot pot."
  },
  {
    "id": "2018",
    "chinese": "红葱牛肉炒饭",
    "sentence": "这份红葱牛肉炒饭很香，可惜稍微油了一点。",
    "sentence_pinyin": "Zhè fèn hóng cōng niú ròu chǎo fàn hěn xiāng, kě xī shāo wēi yóu le yī diǎn.",
    "sentence_english": "This shallot and beef fried rice is fragrant, but unfortunately a little oily."
  },
  {
    "id": "2020",
    "chinese": "酸菜牛肉炒饭",
    "sentence": "酸菜牛肉炒饭有点酸，正好合我的口味。",
    "sentence_pinyin": "Suān cài niú ròu chǎo fàn yǒu diǎn suān, zhèng hǎo hé wǒ de kǒu wèi.",
    "sentence_english": "The pickled-vegetable beef fried rice is a little sour, just the way I like it."
  },
  {
    "id": "2022",
    "chinese": "不计成本用好料",
    "sentence": "老板说他们不计成本用好料，所以价格会高一点。",
    "sentence_pinyin": "Lǎo bǎn shuō tā men bù jì chéng běn yòng hǎo liào, suǒ yǐ jià gé huì gāo yī diǎn.",
    "sentence_english": "The owner says they use good ingredients regardless of cost, so their prices are a little higher."
  },
  {
    "id": "2023",
    "chinese": "虾虾全家桶",
    "sentence": "虾虾全家桶的分量比较大，适合几个人一起点。",
    "sentence_pinyin": "Xiā xiā quán jiā tǒng de fèn liàng bǐ jiào dà, shì hé jǐ gè rén yī qǐ diǎn.",
    "sentence_english": "The shrimp family bucket is quite large and is good for several people to share."
  },
  {
    "id": "2024",
    "chinese": "7颗虾立方",
    "sentence": "菜单上写着一份有七颗虾立方，我们两个人分着吃吧。",
    "sentence_pinyin": "Cài dān shàng xiě zhe yī fèn yǒu qī kē xiā lì fāng, wǒ men liǎng gè rén fēn zhe chī ba.",
    "sentence_english": "The menu says a serving contains seven shrimp cubes; let's share it between the two of us."
  },
  {
    "id": "2025",
    "chinese": "7颗目鱼膏",
    "sentence": "我点了一份七颗目鱼膏，还问店员能不能少放辣椒。",
    "sentence_pinyin": "Wǒ diǎn le yī fèn qī kē mù yú gāo, hái wèn diàn yuán néng bù néng shǎo fàng là jiāo.",
    "sentence_english": "I ordered seven pieces of the menu item called cuttlefish paste and asked whether they could use less chili."
  },
  {
    "id": "2026",
    "chinese": "蟹黄粉丝虾滑",
    "sentence": "我们点了蟹黄粉丝虾滑，还让店员拿了两个小碗。",
    "sentence_pinyin": "Wǒ men diǎn le xiè huáng fěn sī xiā huá, hái ràng diàn yuán ná le liǎng gè xiǎo wǎn.",
    "sentence_english": "We ordered vermicelli and shrimp paste dumplings with crab roe and asked for two small bowls."
  },
  {
    "id": "2027",
    "chinese": "蒜蓉粉丝",
    "sentence": "这份蒜蓉粉丝的蒜味很浓，你介意吗？",
    "sentence_pinyin": "Zhè fèn suàn róng fěn sī de suàn wèi hěn nóng, nǐ jiè yì ma?",
    "sentence_english": "This garlic vermicelli has a strong garlic flavor; do you mind?"
  },
  {
    "id": "2028",
    "chinese": "虾滑粉丝系列",
    "sentence": "菜单上的虾滑粉丝系列有好几种不同的口味。",
    "sentence_pinyin": "Cài dān shàng de xiā huá fěn sī xì liè yǒu hǎo jǐ zhǒng bù tóng de kǒu wèi.",
    "sentence_english": "The menu's shrimp dumpling and vermicelli range comes in several flavors."
  },
  {
    "id": "2030",
    "chinese": "海苔肉松虾滑",
    "sentence": "海苔肉松虾滑听起来很特别，我想点一份尝尝。",
    "sentence_pinyin": "Hǎi tái ròu sōng xiā huá tīng qǐ lái hěn tè bié, wǒ xiǎng diǎn yī fèn cháng cháng.",
    "sentence_english": "Shrimp paste dumplings with seaweed and pork floss sound unusual; I would like to try a serving."
  },
  {
    "id": "2031",
    "chinese": "咖喱纯虾滑",
    "sentence": "这份咖喱纯虾滑不太辣，连不爱吃辣的朋友也喜欢。",
    "sentence_pinyin": "Zhè fèn gā lí chún xiā huá bù tài là, lián bù ài chī là de péng yǒu yě xǐ huān.",
    "sentence_english": "These shrimp paste dumplings in curry sauce are not very spicy; even my friend who dislikes spicy food enjoys them."
  },
  {
    "id": "2032",
    "chinese": "蒜蓉剁椒虾",
    "sentence": "蒜蓉剁椒虾里的剁椒很辣，我吃了几口就开始喝水。",
    "sentence_pinyin": "Suàn róng duò jiāo xiā lǐ de duò jiāo hěn là, wǒ chī le jǐ kǒu jiù kāi shǐ hē shuǐ.",
    "sentence_english": "The chopped chilies in the garlic shrimp are so spicy that I started drinking water after a few bites."
  },
  {
    "id": "2034",
    "chinese": "手工虾滑",
    "sentence": "手工虾滑下锅以后，先等一会儿再夹起来。",
    "sentence_pinyin": "Shǒu gōng xiā huá xià guō yǐ hòu, xiān děng yī huì er zài jiā qǐ lái.",
    "sentence_english": "After putting the handmade shrimp paste dumplings into the pot, wait a little before lifting them out."
  },
  {
    "id": "2035",
    "chinese": "现串现卖",
    "sentence": "这家店的烤串现串现卖，要稍微等一会儿。",
    "sentence_pinyin": "Zhè jiā diàn de kǎo chuàn xiàn chuàn xiàn mài, yào shāo wēi děng yī huì er.",
    "sentence_english": "This shop makes its skewers to order, so there is a short wait."
  },
  {
    "id": "2036",
    "chinese": "招牌肉多多肉夹馍",
    "sentence": "这个招牌肉多多肉夹馍真的塞了很多肉。",
    "sentence_pinyin": "Zhè ge zhāo pái ròu duō duō ròu jiā mó zhēn de sāi le hěn duō ròu.",
    "sentence_english": "This signature extra-meat roujiamo really is packed with meat."
  },
  {
    "id": "2037",
    "chinese": "孜香薄饼烤肉卷",
    "sentence": "孜香薄饼烤肉卷方便拿着吃，适合赶时间的时候买。",
    "sentence_pinyin": "Zī xiāng báo bǐng kǎo ròu juǎn fāng biàn ná zhe chī, shì hé gǎn shí jiān de shí hòu mǎi.",
    "sentence_english": "The cumin flatbread meat wrap is easy to hold and eat, making it handy when you are in a hurry."
  },
  {
    "id": "2040",
    "chinese": "美味土耳其烤肉",
    "sentence": "招牌上写着“美味土耳其烤肉”，店门口还排着队。",
    "sentence_pinyin": "Zhāo pái shàng xiě zhe “měi wèi tǔ ěr qí kǎo ròu”, diàn mén kǒu hái pái zhe duì.",
    "sentence_english": "The sign says “Delicious Turkish Kebab,” and there is a queue outside the shop."
  },
  {
    "id": "2042",
    "chinese": "现打新鲜果汁",
    "sentence": "我想要一杯现打新鲜果汁，不要加糖。",
    "sentence_pinyin": "Wǒ xiǎng yào yī bēi xiàn dǎ xīn xiān guǒ zhī, bù yào jiā táng.",
    "sentence_english": "I would like a freshly made fruit juice without added sugar."
  },
  {
    "id": "2047",
    "chinese": "特调茶饮700cc系列",
    "sentence": "店里的特调茶饮七百毫升系列可以选冰的或热的。",
    "sentence_pinyin": "Diàn lǐ de tè tiáo chá yǐn qī bǎi háo shēng xì liè kě yǐ xuǎn bīng de huò rè de.",
    "sentence_english": "The shop's range of special 700-milliliter tea drinks can be ordered iced or hot."
  },
  {
    "id": "2050",
    "chinese": "绿豆沙牛奶(夏季)",
    "sentence": "绿豆沙牛奶是夏季饮品，冬天可能买不到。",
    "sentence_pinyin": "Lǜ dòu shā niú nǎi shì xià jì yǐn pǐn, dōng tiān kě néng mǎi bù dào.",
    "sentence_english": "Mung bean slush with milk is a summer drink and may not be available in winter."
  },
  {
    "id": "2051",
    "chinese": "梅子红茶",
    "sentence": "这杯梅子红茶酸酸甜甜的，喝起来很清爽。",
    "sentence_pinyin": "Zhè bēi méi zi hóng chá suān suān tián tián de, hē qǐ lái hěn qīng shuǎng.",
    "sentence_english": "This plum black tea tastes sweet and tart and is very refreshing."
  },
  {
    "id": "2052",
    "chinese": "冬瓜柠檬茶",
    "sentence": "店员建议我试试冬瓜柠檬茶，我就点了一小杯。",
    "sentence_pinyin": "Diàn yuán jiàn yì wǒ shì shì dōng guā níng méng chá, wǒ jiù diǎn le yī xiǎo bēi.",
    "sentence_english": "The server suggested trying winter melon lemon tea, so I ordered a small cup."
  },
  {
    "id": "2053",
    "chinese": "香蕉奶冰沙",
    "sentence": "香蕉奶冰沙太冰了，我想放一会儿再喝。",
    "sentence_pinyin": "Xiāng jiāo nǎi bīng shā tài bīng le, wǒ xiǎng fàng yī huì er zài hē.",
    "sentence_english": "The banana milk smoothie is too cold, so I want to leave it for a while before drinking."
  },
  {
    "id": "2054",
    "chinese": "养乐多冰沙",
    "sentence": "他买了一杯养乐多冰沙，坐在树荫下慢慢喝。",
    "sentence_pinyin": "Tā mǎi le yī bēi yǎng lè duō bīng shā, zuò zài shù yīn xià màn màn hē.",
    "sentence_english": "He bought a Yakult smoothie and slowly drank it in the shade."
  },
  {
    "id": "2062",
    "chinese": "这种心理",
    "sentence": "我能理解这种心理，但不一定同意他的做法。",
    "sentence_pinyin": "Wǒ néng lǐ jiě zhè zhǒng xīn lǐ, dàn bù yī dìng tóng yì tā de zuò fǎ.",
    "sentence_english": "I can understand this way of thinking, but I do not necessarily agree with what he does."
  },
  {
    "id": "2069",
    "chinese": "大多数男性",
    "sentence": "调查中，大多数男性表示愿意分担家务。",
    "sentence_pinyin": "Diào chá zhōng, dà duō shù nán xìng biǎo shì yuàn yì fēn dān jiā wù.",
    "sentence_english": "In the survey, most men said they were willing to share the housework."
  },
  {
    "id": "2070",
    "chinese": "然后基本上",
    "sentence": "我先把资料整理好，然后基本上就可以开始写报告了。",
    "sentence_pinyin": "Wǒ xiān bǎ zī liào zhěng lǐ hǎo, rán hòu jī běn shàng jiù kě yǐ kāi shǐ xiě bào gào le.",
    "sentence_english": "I organize the material first, and then I am basically ready to start writing the report."
  },
  {
    "id": "2077",
    "chinese": "尴尬",
    "sentence": "我把他的名字叫错了，觉得特别尴尬。",
    "sentence_pinyin": "Wǒ bǎ tā de míng zì jiào cuò le, jué de tè bié gān gà.",
    "sentence_english": "I got his name wrong and felt very embarrassed."
  },
  {
    "id": "2080",
    "chinese": "守株待兔",
    "sentence": "想找到好工作就要主动投简历，不能只在家里守株待兔。",
    "sentence_pinyin": "Xiǎng zhǎo dào hǎo gōng zuò jiù yào zhǔ dòng tóu jiǎn lì, bù néng zhǐ zài jiā lǐ shǒu zhū dài tù.",
    "sentence_english": "To find a good job, you need to send out applications rather than sit at home waiting for an opportunity."
  },
  {
    "id": "2099",
    "chinese": "很疲劳",
    "sentence": "昨晚没睡好，我今天觉得很疲劳。",
    "sentence_pinyin": "Zuó wǎn méi shuì hǎo, wǒ jīn tiān jué de hěn pí láo.",
    "sentence_english": "I did not sleep well last night and feel very tired today."
  },
  {
    "id": "2114",
    "chinese": "其他语言",
    "sentence": "除了中文，你还会说其他语言吗？",
    "sentence_pinyin": "Chú le zhōng wén, nǐ hái huì shuō qí tā yǔ yán ma?",
    "sentence_english": "Besides Chinese, do you speak any other languages?"
  },
  {
    "id": "2118",
    "chinese": "复杂的游戏",
    "sentence": "这是一个复杂的游戏，第一次玩最好有人教。",
    "sentence_pinyin": "Zhè shì yī gè fù zá de yóu xì, dì yī cì wán zuì hǎo yǒu rén jiāo.",
    "sentence_english": "This is a complicated game; it is best to have someone teach you the first time."
  },
  {
    "id": "2135",
    "chinese": "阳光太亮",
    "sentence": "阳光太亮，我得把窗帘拉上才能看清屏幕。",
    "sentence_pinyin": "Yáng guāng tài liàng, wǒ děi bǎ chuāng lián lā shàng cái néng kàn qīng píng mù.",
    "sentence_english": "The sunlight is too bright; I need to close the curtains to see the screen clearly."
  },
  {
    "id": "2138",
    "chinese": "令人讨厌的人",
    "sentence": "他并不是令人讨厌的人，只是不太会表达自己。",
    "sentence_pinyin": "Tā bìng bù shì lìng rén tǎo yàn de rén, zhǐ shì bù tài huì biǎo dá zì jǐ.",
    "sentence_english": "He is not an unpleasant person; he just has trouble expressing himself."
  },
  {
    "id": "2156",
    "chinese": "男德",
    "sentence": "她开玩笑说他应该学学男德，别总把家务留给别人。",
    "sentence_pinyin": "Tā kāi wán xiào shuō tā yīng gāi xué xué nán dé, bié zǒng bǎ jiā wù liú gěi bié rén.",
    "sentence_english": "She joked that he should learn some “male virtue” instead of always leaving the housework to others."
  },
  {
    "id": "2157",
    "chinese": "男人的三从四德",
    "sentence": "她用“男人的三从四德”这个说法开玩笑，讨论夫妻如何分担家务。",
    "sentence_pinyin": "Tā yòng “nán rén de sān cóng sì dé” zhè ge shuō fǎ kāi wán xiào, tǎo lùn fū qī rú hé fēn dān jiā wù.",
    "sentence_english": "She jokingly used the phrase “the three obediences and four virtues for men” while discussing how spouses should share household chores."
  },
  {
    "id": "2181",
    "chinese": "它叫",
    "sentence": "我养了一只猫，它叫豆豆。",
    "sentence_pinyin": "Wǒ yǎng le yī zhī māo, tā jiào dòu dòu.",
    "sentence_english": "I have a cat called Doudou."
  },
  {
    "id": "2182",
    "chinese": "这里的高度",
    "sentence": "这里的高度比城里高，晚上会凉一些。",
    "sentence_pinyin": "Zhè lǐ de gāo dù bǐ chéng lǐ gāo, wǎn shàng huì liáng yī xiē.",
    "sentence_english": "The elevation here is higher than in the city, so it gets cooler at night."
  },
  {
    "id": "2249",
    "chinese": "好冷淡",
    "sentence": "他今天对我好冷淡，我不知道是不是哪里说错了话。",
    "sentence_pinyin": "Tā jīn tiān duì wǒ hǎo lěng dàn, wǒ bù zhī dào shì bù shì nǎ lǐ shuō cuò le huà.",
    "sentence_english": "He is so distant toward me today; I do not know whether I said something wrong."
  },
  {
    "id": "2325",
    "chinese": "剩1间",
    "sentence": "页面显示只剩一间，但我还想再比较一下价格。",
    "sentence_pinyin": "Yè miàn xiǎn shì zhǐ shèng yī jiān, dàn wǒ hái xiǎng zài bǐ jiào yī xià jià gé.",
    "sentence_english": "The page says there is only one room left, but I still want to compare prices."
  },
  {
    "id": "2328",
    "chinese": "用于接收订单信息",
    "sentence": "这个邮箱专门用于接收订单信息。",
    "sentence_pinyin": "Zhè ge yóu xiāng zhuān mén yòng yú jiē shōu dìng dān xìn xī.",
    "sentence_english": "This email address is used exclusively to receive order information."
  },
  {
    "id": "2329",
    "chinese": "新客专享",
    "sentence": "这张优惠券是新客专享，老顾客不能用。",
    "sentence_pinyin": "Zhè zhāng yōu huì quàn shì xīn kè zhuān xiǎng, lǎo gù kè bù néng yòng.",
    "sentence_english": "This coupon is exclusively for new customers; existing customers cannot use it."
  },
  {
    "id": "2330",
    "chinese": "已省",
    "sentence": "付款页面显示，这次购物已省二十元。",
    "sentence_pinyin": "Fù kuǎn yè miàn xiǎn shì, zhè cì gòu wù yǐ shěng èr shí yuán.",
    "sentence_english": "The payment page shows that I have saved twenty yuan on this purchase."
  },
  {
    "id": "2331",
    "chinese": "促销活动",
    "sentence": "这家超市周末有促销活动，牛奶比平时便宜。",
    "sentence_pinyin": "Zhè jiā chāo shì zhōu mò yǒu cù xiāo huó dòng, niú nǎi bǐ píng shí pián yi.",
    "sentence_english": "This supermarket has a promotion at the weekend, and milk is cheaper than usual."
  },
  {
    "id": "2332",
    "chinese": "2项优惠",
    "sentence": "这笔订单有两项优惠，但只能选其中一项。",
    "sentence_pinyin": "Zhè bǐ dìng dān yǒu liǎng xiàng yōu huì, dàn zhǐ néng xuǎn qí zhōng yī xiàng.",
    "sentence_english": "There are two offers for this order, but you can choose only one."
  },
  {
    "id": "2341",
    "chinese": "入选2025必去傍",
    "sentence": "这家店入选了二零二五年的必去榜，不过我还是想先看看评价。",
    "sentence_pinyin": "Zhè jiā diàn rù xuǎn le èr líng èr wǔ nián de bì qù bǎng, bù guò wǒ hái shì xiǎng xiān kàn kàn píng jià.",
    "sentence_english": "This shop was selected for a 2025 must-visit list, but I still want to read the reviews first."
  },
  {
    "id": "2343",
    "chinese": "回归自然",
    "sentence": "周末去山里走走，让我有一种回归自然的感觉。",
    "sentence_pinyin": "Zhōu mò qù shān lǐ zǒu zǒu, ràng wǒ yǒu yī zhǒng huí guī zì rán de gǎn jué.",
    "sentence_english": "Taking a walk in the mountains at the weekend gives me a feeling of returning to nature."
  },
  {
    "id": "2344",
    "chinese": "景色宜人",
    "sentence": "这里景色宜人，很适合慢慢散步。",
    "sentence_pinyin": "Zhè lǐ jǐng sè yí rén, hěn shì hé màn màn sàn bù.",
    "sentence_english": "The scenery here is pleasant, making it a lovely place for a leisurely walk."
  },
  {
    "id": "2350",
    "chinese": "驾车9公里20分钟",
    "sentence": "导航显示驾车九公里大约需要二十分钟。",
    "sentence_pinyin": "Dǎo háng xiǎn shì jià chē jiǔ gōng lǐ dà yuē xū yào èr shí fēn zhōng.",
    "sentence_english": "The navigation app says driving nine kilometers will take about twenty minutes."
  },
  {
    "id": "2359",
    "chinese": "可订明日",
    "sentence": "页面上写着“可订明日”，所以我打算今晚先买票。",
    "sentence_pinyin": "Yè miàn shàng xiě zhe “kě dìng míng rì”, suǒ yǐ wǒ dǎ suàn jīn wǎn xiān mǎi piào.",
    "sentence_english": "The page says “Available to book for tomorrow,” so I plan to buy tickets tonight."
  },
  {
    "id": "2363",
    "chinese": "极速出票",
    "sentence": "平台虽然说可以极速出票，我还是提前买好了车票。",
    "sentence_pinyin": "Píng tái suī rán shuō kě yǐ jí sù chū piào, wǒ hái shì tí qián mǎi hǎo le chē piào.",
    "sentence_english": "Although the platform promises very fast ticket issuance, I bought my train ticket ahead of time anyway."
  },
  {
    "id": "2367",
    "chinese": "有效期至",
    "sentence": "这张优惠券的有效期至月底，别忘了使用。",
    "sentence_pinyin": "Zhè zhāng yōu huì quàn de yǒu xiào qī zhì yuè dǐ, bié wàng le shǐ yòng.",
    "sentence_english": "This coupon is valid until the end of the month; do not forget to use it."
  },
  {
    "id": "2370",
    "chinese": "仅行人",
    "sentence": "牌子上写着“仅行人”，自行车不能从这里通过。",
    "sentence_pinyin": "Pái zi shàng xiě zhe “jǐn xíng rén”, zì xíng chē bù néng cóng zhè lǐ tōng guò.",
    "sentence_english": "The sign says “Pedestrians only,” so bicycles cannot pass through here."
  },
  {
    "id": "2381",
    "chinese": "我的收藏",
    "sentence": "我把这家餐厅加进了“我的收藏”，下次方便找到。",
    "sentence_pinyin": "Wǒ bǎ zhè jiā cān tīng jiā jìn le “wǒ de shōu cáng”, xià cì fāng biàn zhǎo dào.",
    "sentence_english": "I added this restaurant to “My favorites” so it will be easy to find next time."
  },
  {
    "id": "2386",
    "chinese": "热点区域",
    "sentence": "地图上标出了几个热点区域，方便游客安排路线。",
    "sentence_pinyin": "Dì tú shàng biāo chū le jǐ gè rè diǎn qū yù, fāng biàn yóu kè ān pái lù xiàn.",
    "sentence_english": "The map marks several popular areas to help visitors plan their routes."
  },
  {
    "id": "2390",
    "chinese": "便捷可达",
    "sentence": "这家酒店离地铁站很近，坐公共交通便捷可达。",
    "sentence_pinyin": "Zhè jiā jiǔ diàn lí dì tiě zhàn hěn jìn, zuò gōng gòng jiāo tōng biàn jié kě dá.",
    "sentence_english": "This hotel is close to a metro station and is easily accessible by public transport."
  },
  {
    "id": "2391",
    "chinese": "行程攻略",
    "sentence": "出发前，我在网上看了几篇行程攻略。",
    "sentence_pinyin": "Chū fā qián, wǒ zài wǎng shàng kàn le jǐ piān xíng chéng gōng lüè.",
    "sentence_english": "Before leaving, I read several itinerary guides online."
  },
  {
    "id": "2392",
    "chinese": "休闲娱乐",
    "sentence": "工作再忙，也要给自己留一点休闲娱乐的时间。",
    "sentence_pinyin": "Gōng zuò zài máng, yě yào gěi zì jǐ liú yī diǎn xiū xián yú lè de shí jiān.",
    "sentence_english": "No matter how busy work gets, leave yourself some time for leisure and entertainment."
  },
  {
    "id": "2399",
    "chinese": "人流量情况",
    "sentence": "出发前，我想先了解一下景区的人流量情况。",
    "sentence_pinyin": "Chū fā qián, wǒ xiǎng xiān liǎo jiě yī xià jǐng qū de rén liú liàng qíng kuàng.",
    "sentence_english": "Before leaving, I want to check how crowded the scenic area is."
  },
  {
    "id": "2403",
    "chinese": "人气爆款",
    "sentence": "这款面包是店里的人气爆款，下午常常就卖完了。",
    "sentence_pinyin": "Zhè kuǎn miàn bāo shì diàn lǐ de rén qì bào kuǎn, xià wǔ cháng cháng jiù mài wán le.",
    "sentence_english": "This bread is one of the shop's bestsellers and often sells out by the afternoon."
  },
  {
    "id": "2596",
    "chinese": "沪牌中高档车两辆",
    "sentence": "广告上写着“沪牌中高档车两辆”，但我更关心对方的性格。",
    "sentence_pinyin": "Guǎng gào shàng xiě zhe “hù pái zhōng gāo dàng chē liǎng liàng”, dàn wǒ gèng guān xīn duì fāng de xìng gé.",
    "sentence_english": "The personal ad says “two mid- to high-end cars with Shanghai plates,” but I care more about the person's character."
  },
  {
    "id": "2796",
    "chinese": "过了第一个路口",
    "sentence": "过了第一个路口以后，继续往前走就能看到车站。",
    "sentence_pinyin": "Guò le dì yī gè lù kǒu yǐ hòu, jì xù wǎng qián zǒu jiù néng kàn dào chē zhàn.",
    "sentence_english": "After passing the first intersection, keep going straight and you will see the station."
  },
  {
    "id": "2809",
    "chinese": "大概两个小时",
    "sentence": "从这里坐火车到杭州，大概两个小时就到了。",
    "sentence_pinyin": "Cóng zhè lǐ zuò huǒ chē dào háng zhōu, dà gài liǎng gè xiǎo shí jiù dào le.",
    "sentence_english": "It takes about two hours to get to Hangzhou from here by train."
  },
  {
    "id": "2820",
    "chinese": "我的性格是",
    "sentence": "我的性格是比较慢热的，熟悉以后话就多了。",
    "sentence_pinyin": "Wǒ de xìng gé shì bǐ jiào màn rè de, shú xī yǐ hòu huà jiù duō le.",
    "sentence_english": "I take a little time to warm up to people, but I talk more once I get to know them."
  },
  {
    "id": "2825",
    "chinese": "我放松的方式是",
    "sentence": "我放松的方式是散步，有时候也听音乐。",
    "sentence_pinyin": "Wǒ fàng sōng de fāng shì shì sàn bù, yǒu shí hòu yě tīng yīn yuè.",
    "sentence_english": "My way of relaxing is to take a walk, and sometimes I listen to music too."
  },
  {
    "id": "2828",
    "chinese": "不想做任何事情",
    "sentence": "今天太累了，我不想做任何事情，只想早点睡。",
    "sentence_pinyin": "Jīn tiān tài lèi le, wǒ bù xiǎng zuò rèn hé shì qíng, zhǐ xiǎng zǎo diǎn shuì.",
    "sentence_english": "I am so tired today that I do not want to do anything; I just want to go to bed early."
  },
  {
    "id": "2880",
    "chinese": "我在大学四年级的时候",
    "sentence": "我在大学四年级的时候，开始考虑毕业以后去哪里工作。",
    "sentence_pinyin": "Wǒ zài dà xué sì nián jí de shí hòu, kāi shǐ kǎo lǜ bì yè yǐ hòu qù nǎ lǐ gōng zuò.",
    "sentence_english": "When I was a university senior, I started thinking about where to work after graduation."
  },
  {
    "id": "2881",
    "chinese": "我喝完咖啡以后",
    "sentence": "我喝完咖啡以后，就去附近的公园散步了。",
    "sentence_pinyin": "Wǒ hē wán kā fēi yǐ hòu, jiù qù fù jìn de gōng yuán sàn bù le.",
    "sentence_english": "After finishing my coffee, I went for a walk in the nearby park."
  },
  {
    "id": "2888",
    "chinese": "侄子 哥哥的儿子",
    "sentence": "这是我的侄子，也就是我哥哥的儿子。",
    "sentence_pinyin": "Zhè shì wǒ de zhí zi, yě jiù shì wǒ gē gē de ér zi.",
    "sentence_english": "This is my nephew, my older brother's son."
  },
  {
    "id": "2889",
    "chinese": "侄女 弟弟的女儿",
    "sentence": "我侄女是我弟弟的女儿，今年刚上小学。",
    "sentence_pinyin": "Wǒ zhí nǚ shì wǒ dì di de nǚ ér, jīn nián gāng shàng xiǎo xué.",
    "sentence_english": "My niece is my younger brother's daughter, and she just started primary school this year."
  },
  {
    "id": "2890",
    "chinese": "外甥 姐姐的儿子",
    "sentence": "我姐姐的儿子是我的外甥，我们经常一起玩。",
    "sentence_pinyin": "Wǒ jiě jiě de ér zi shì wǒ de wài shēng, wǒ men jīng cháng yī qǐ wán.",
    "sentence_english": "My older sister's son is my nephew, and we often play together."
  },
  {
    "id": "2891",
    "chinese": "外甥女 妹妹的女儿",
    "sentence": "我妹妹的女儿是我的外甥女，她特别喜欢画画。",
    "sentence_pinyin": "Wǒ mèi mèi de nǚ ér shì wǒ de wài shēng nǚ, tā tè bié xǐ huān huà huà.",
    "sentence_english": "My younger sister's daughter is my niece, and she really likes drawing."
  },
  {
    "id": "2928",
    "chinese": "酱油和陈醋",
    "sentence": "吃饺子的时候，我喜欢把酱油和陈醋混在一起。",
    "sentence_pinyin": "Chī jiǎo zi de shí hòu, wǒ xǐ huān bǎ jiàng yóu hé chén cù hùn zài yī qǐ.",
    "sentence_english": "When eating dumplings, I like to mix soy sauce and aged vinegar."
  },
  {
    "id": "2943",
    "chinese": "因为在日落之前，我们就离开了",
    "sentence": "我们没看到晚霞，因为在日落之前，我们就离开了。",
    "sentence_pinyin": "Wǒ men méi kàn dào wǎn xiá, yīn wèi zài rì luò zhī qián, wǒ men jiù lí kāi le.",
    "sentence_english": "We did not see the sunset colors because we had already left before sunset."
  },
  {
    "id": "2981",
    "chinese": "并没有说",
    "sentence": "我并没有说不想去，只是还没决定时间。",
    "sentence_pinyin": "Wǒ bìng méi yǒu shuō bù xiǎng qù, zhǐ shì hái méi jué dìng shí jiān.",
    "sentence_english": "I did not say I did not want to go; I just have not decided on a time yet."
  },
  {
    "id": "2985",
    "chinese": "情人节前后",
    "sentence": "情人节前后，这家花店总是特别忙。",
    "sentence_pinyin": "Qíng rén jié qián hòu, zhè jiā huā diàn zǒng shì tè bié máng.",
    "sentence_english": "This flower shop is always especially busy around Valentine's Day."
  },
  {
    "id": "3014",
    "chinese": "其实我是",
    "sentence": "其实我是第一次来这里，还不太熟悉附近的路。",
    "sentence_pinyin": "Qí shí wǒ shì dì yī cì lái zhè lǐ, hái bù tài shú xī fù jìn de lù.",
    "sentence_english": "Actually, this is my first time here, and I do not know the nearby streets very well yet."
  },
  {
    "id": "3042",
    "chinese": "如果你确定了",
    "sentence": "如果你确定了出发时间，就给我发个消息。",
    "sentence_pinyin": "Rú guǒ nǐ què dìng le chū fā shí jiān, jiù gěi wǒ fā gè xiāo xī.",
    "sentence_english": "If you have settled on a departure time, send me a message."
  },
  {
    "id": "3055",
    "chinese": "宝藏咖啡店",
    "sentence": "这家宝藏咖啡店藏在小巷里，不太容易找到。",
    "sentence_pinyin": "Zhè jiā bǎo zàng kā fēi diàn cáng zài xiǎo xiàng lǐ, bù tài róng yì zhǎo dào.",
    "sentence_english": "This hidden-gem cafe is tucked away in an alley and is not easy to find."
  },
  {
    "id": "3056",
    "chinese": "好消息 坏消息",
    "sentence": "我有一个好消息和一个坏消息，你想先听哪个？",
    "sentence_pinyin": "Wǒ yǒu yī gè hǎo xiāo xī hé yī gè huài xiāo xī, nǐ xiǎng xiān tīng nǎ ge?",
    "sentence_english": "I have some good news and some bad news; which would you like to hear first?"
  },
  {
    "id": "3057",
    "chinese": "让人难过的消息",
    "sentence": "这真是一个让人难过的消息，我需要一点时间接受。",
    "sentence_pinyin": "Zhè zhēn shì yī gè ràng rén nán guò de xiāo xī, wǒ xū yào yī diǎn shí jiān jiē shòu.",
    "sentence_english": "This is really upsetting news, and I need some time to take it in."
  },
  {
    "id": "3066",
    "chinese": "水牛奶专卖店",
    "sentence": "路口有一家水牛奶专卖店，我想进去看看。",
    "sentence_pinyin": "Lù kǒu yǒu yī jiā shuǐ niú nǎi zhuān mài diàn, wǒ xiǎng jìn qù kàn kàn.",
    "sentence_english": "There is a buffalo milk specialty shop at the intersection, and I would like to have a look inside."
  },
  {
    "id": "3088",
    "chinese": "浪太大",
    "sentence": "今天浪太大，我们还是别下海游泳了。",
    "sentence_pinyin": "Jīn tiān làng tài dà, wǒ men hái shì bié xià hǎi yóu yǒng le.",
    "sentence_english": "The waves are too big today; we had better not swim in the sea."
  },
  {
    "id": "3097",
    "chinese": "无数的奶茶店",
    "sentence": "这条街上好像有无数的奶茶店，每走几步就能看到一家。",
    "sentence_pinyin": "Zhè tiáo jiē shàng hǎo xiàng yǒu wú shù de nǎi chá diàn, měi zǒu jǐ bù jiù néng kàn dào yī jiā.",
    "sentence_english": "There seem to be countless milk tea shops on this street; there is one every few steps."
  },
  {
    "id": "3100",
    "chinese": "地区限定产品",
    "sentence": "这种口味是地区限定产品，在别的城市不一定买得到。",
    "sentence_pinyin": "Zhè zhǒng kǒu wèi shì dì qū xiàn dìng chǎn pǐn, zài bié de chéng shì bù yī dìng mǎi de dào.",
    "sentence_english": "This flavor is a regional exclusive and may not be available in other cities."
  },
  {
    "id": "3127",
    "chinese": "薄的纸巾还是后的纸巾",
    "sentence": "你想买薄的纸巾还是厚的纸巾？",
    "sentence_pinyin": "Nǐ xiǎng mǎi báo de zhǐ jīn hái shì hòu de zhǐ jīn?",
    "sentence_english": "Would you like to buy thin tissues or thick ones?"
  },
  {
    "id": "3133",
    "chinese": "重启我的电脑",
    "sentence": "这个程序一直打不开，我打算重启我的电脑。",
    "sentence_pinyin": "Zhè ge chéng xù yī zhí dǎ bù kāi, wǒ dǎ suàn chóng qǐ wǒ de diàn nǎo.",
    "sentence_english": "This program will not open, so I plan to restart my computer."
  },
  {
    "id": "3134",
    "chinese": "更新我的电脑",
    "sentence": "我今晚要更新我的电脑，可能暂时不能视频聊天。",
    "sentence_pinyin": "Wǒ jīn wǎn yào gēng xīn wǒ de diàn nǎo, kě néng zàn shí bù néng shì pín liáo tiān.",
    "sentence_english": "I need to update my computer tonight, so I may not be able to video chat for a while."
  },
  {
    "id": "3137",
    "chinese": "海水的味道",
    "sentence": "这道汤太咸了，有点像海水的味道。",
    "sentence_pinyin": "Zhè dào tāng tài xián le, yǒu diǎn xiàng hǎi shuǐ de wèi dào.",
    "sentence_english": "This soup is too salty; it tastes a little like seawater."
  },
  {
    "id": "3158",
    "chinese": "好聪明的小偷",
    "sentence": "电影里那个小偷真聪明，但最后还是被抓住了。",
    "sentence_pinyin": "Diàn yǐng lǐ nà ge xiǎo tōu zhēn cōng míng, dàn zuì hòu hái shì bèi zhuā zhù le.",
    "sentence_english": "The thief in the film was clever, but he was caught in the end anyway."
  },
  {
    "id": "3171",
    "chinese": "性价比很高=很划算+很实用",
    "sentence": "这件东西既划算又实用，所以我觉得性价比很高。",
    "sentence_pinyin": "Zhè jiàn dōng xī jì huá suàn yòu shí yòng, suǒ yǐ wǒ jué de xìng jià bǐ hěn gāo.",
    "sentence_english": "This item is both good value and practical, so I think it offers excellent value for money."
  },
  {
    "id": "3188",
    "chinese": "川流 河 江",
    "sentence": "汉语里可以用“川”“河”“江”等字来表示河流。",
    "sentence_pinyin": "Hàn yǔ lǐ kě yǐ yòng “chuān”“hé”“jiāng” děng zì lái biǎo shì hé liú.",
    "sentence_english": "In Chinese, characters such as chuan, he, and jiang can refer to rivers."
  },
  {
    "id": "3212",
    "chinese": "在别的方面照顾他",
    "sentence": "我帮不了他的工作，但可以在别的方面照顾他。",
    "sentence_pinyin": "Wǒ bāng bù liǎo tā de gōng zuò, dàn kě yǐ zài bié de fāng miàn zhào gù tā.",
    "sentence_english": "I cannot help him with his work, but I can look after him in other ways."
  },
  {
    "id": "3222",
    "chinese": "允许一切发生",
    "sentence": "允许一切发生，并不意味着什么问题都不处理。",
    "sentence_pinyin": "Yǔn xǔ yī qiè fā shēng, bìng bù yì wèi zhe shén me wèn tí dōu bù chǔ lǐ.",
    "sentence_english": "Allowing things to happen does not mean refusing to deal with any problems."
  },
  {
    "id": "3375",
    "chinese": "生意冷清",
    "sentence": "下雨的时候，这家店常常生意冷清。",
    "sentence_pinyin": "Xià yǔ de shí hòu, zhè jiā diàn cháng cháng shēng yì lěng qīng.",
    "sentence_english": "Business is often quiet at this shop when it rains."
  },
  {
    "id": "3580",
    "chinese": "拍老板的马屁",
    "sentence": "他不喜欢拍老板的马屁，更愿意用工作成绩证明自己。",
    "sentence_pinyin": "Tā bù xǐ huān pāi lǎo bǎn de mǎ pì, gèng yuàn yì yòng gōng zuò chéng jì zhèng míng zì jǐ.",
    "sentence_english": "He dislikes flattering the boss and prefers to prove himself through his work."
  },
  {
    "id": "3583",
    "chinese": "展现自己的中文水平",
    "sentence": "这次交流活动给了我一个展现自己的中文水平的机会。",
    "sentence_pinyin": "Zhè cì jiāo liú huó dòng gěi le wǒ yī gè zhǎn xiàn zì jǐ de zhōng wén shuǐ píng de jī huì.",
    "sentence_english": "This exchange event gave me an opportunity to demonstrate my Chinese skills."
  },
  {
    "id": "3589",
    "chinese": "发自内心的喜欢中文",
    "sentence": "我发自内心地喜欢中文，不只是为了考试才学习。",
    "sentence_pinyin": "Wǒ fā zì nèi xīn de xǐ huān zhōng wén, bù zhǐ shì wèi le kǎo shì cái xué xí.",
    "sentence_english": "I love Chinese from the bottom of my heart; I do not study it just for exams."
  },
  {
    "id": "3685",
    "chinese": "获取验证码",
    "sentence": "输入手机号以后，点击“获取验证码”。",
    "sentence_pinyin": "Shū rù shǒu jī hào yǐ hòu, diǎn jī “huò qǔ yàn zhèng mǎ”.",
    "sentence_english": "After entering your phone number, tap “Get verification code.”"
  },
  {
    "id": "3687",
    "chinese": "实名认证",
    "sentence": "这个账号要先完成实名认证，才能使用全部功能。",
    "sentence_pinyin": "Zhè ge zhàng hào yào xiān wán chéng shí míng rèn zhèng, cái néng shǐ yòng quán bù gōng néng.",
    "sentence_english": "This account needs real-name verification before all its features can be used."
  },
  {
    "id": "3821",
    "chinese": "¥61.2 券后价",
    "sentence": "这件商品的券后价是六十一点二元，比原价便宜一些。",
    "sentence_pinyin": "Zhè jiàn shāng pǐn de quàn hòu jià shì liù shí yī diǎn èr yuán, bǐ yuán jià pián yi yī xiē.",
    "sentence_english": "This item costs 61.2 yuan after the coupon, a little less than the original price."
  },
  {
    "id": "3823",
    "chinese": "券后 ¥28.5 起",
    "sentence": "页面写着“券后二十八点五元起”，但我选的款式更贵。",
    "sentence_pinyin": "Yè miàn xiě zhe “quàn hòu èr shí bā diǎn wǔ yuán qǐ”, dàn wǒ xuǎn de kuǎn shì gèng guì.",
    "sentence_english": "The page says “From 28.5 yuan after the coupon,” but the version I chose costs more."
  },
  {
    "id": "3824",
    "chinese": "优惠前 ¥32.9 起",
    "sentence": "优惠前三十二点九元起，并不代表每一种款式都一样贵。",
    "sentence_pinyin": "Yōu huì qián sān shí èr diǎn jiǔ yuán qǐ, bìng bù dài biǎo měi yī zhǒng kuǎn shì dōu yī yàng guì.",
    "sentence_english": "A starting price of 32.9 yuan before discounts does not mean every version costs the same."
  },
  {
    "id": "3826",
    "chinese": "免运费",
    "sentence": "订单满五十元就免运费，我还差五元。",
    "sentence_pinyin": "Dìng dān mǎn wǔ shí yuán jiù miǎn yùn fèi, wǒ hái chà wǔ yuán.",
    "sentence_english": "Shipping is free on orders of fifty yuan or more, and I am five yuan short."
  },
  {
    "id": "3828",
    "chinese": "平均好评率",
    "sentence": "选择酒店时，我会看看平均好评率，也会读几条差评。",
    "sentence_pinyin": "Xuǎn zé jiǔ diàn shí, wǒ huì kàn kàn píng jūn hǎo píng lǜ, yě huì dú jǐ tiáo chà píng.",
    "sentence_english": "When choosing a hotel, I check the average positive review rate and also read a few negative reviews."
  },
  {
    "id": "3833",
    "chinese": "7天无理由退货",
    "sentence": "商品页面写着“七天无理由退货”，我想先看看具体条件。",
    "sentence_pinyin": "Shāng pǐn yè miàn xiě zhe “qī tiān wú lǐ yóu tuì huò”, wǒ xiǎng xiān kàn kàn jù tǐ tiáo jiàn.",
    "sentence_english": "The product page says “Returns within seven days without a reason,” and I want to check the specific conditions first."
  },
  {
    "id": "3834",
    "chinese": "待付款",
    "sentence": "这笔订单还显示待付款，你是不是忘了支付？",
    "sentence_pinyin": "Zhè bǐ dìng dān hái xiǎn shì dài fù kuǎn, nǐ shì bù shì wàng le zhī fù?",
    "sentence_english": "This order still says “Pending payment”; did you forget to pay?"
  },
  {
    "id": "4043",
    "chinese": "网红打卡地",
    "sentence": "这里虽然是网红打卡地，但平日早上人不多。",
    "sentence_pinyin": "Zhè lǐ suī rán shì wǎng hóng dǎ kǎ dì, dàn píng rì zǎo shàng rén bù duō.",
    "sentence_english": "Although this is a popular social-media photo spot, it is not crowded on weekday mornings."
  },
  {
    "id": "4107",
    "chinese": "皇帝不急太监急",
    "sentence": "他自己都不着急，你就别皇帝不急太监急了。",
    "sentence_pinyin": "Tā zì jǐ dōu bù zháo jí, nǐ jiù bié huáng dì bù jí tài jiàn jí le.",
    "sentence_english": "He is not worried himself, so do not get more worked up than the person actually concerned."
  },
  {
    "id": "4113",
    "chinese": "星期几",
    "sentence": "你知道今天星期几吗？我记不清了。",
    "sentence_pinyin": "Nǐ zhī dào jīn tiān xīng qī jǐ ma? Wǒ jì bù qīng le.",
    "sentence_english": "Do you know what day of the week it is? I cannot remember."
  },
  {
    "id": "4114",
    "chinese": "几月几号",
    "sentence": "你的生日是几月几号？我想记下来。",
    "sentence_pinyin": "Nǐ de shēng rì shì jǐ yuè jǐ hào? Wǒ xiǎng jì xià lái.",
    "sentence_english": "What month and day is your birthday? I would like to write it down."
  },
  {
    "id": "4156",
    "chinese": "韩国的整容 中国的PS",
    "sentence": "他拿“韩国的整容、中国的修图”作比较，我觉得这种说法太笼统了。",
    "sentence_pinyin": "Tā ná “hán guó de zhěng róng, zhōng guó de xiū tú” zuò bǐ jiào, wǒ jué de zhè zhǒng shuō fǎ tài lǒng tǒng le.",
    "sentence_english": "He compared cosmetic surgery in Korea with photo editing in China, but I thought that was an overgeneralization."
  },
  {
    "id": "4343",
    "chinese": "不太会说中文",
    "sentence": "我不太会说中文，可以请你说慢一点吗？",
    "sentence_pinyin": "Wǒ bù tài huì shuō zhōng wén, kě yǐ qǐng nǐ shuō màn yī diǎn ma?",
    "sentence_english": "I do not speak Chinese very well; could you please speak a little more slowly?"
  },
  {
    "id": "4373",
    "chinese": "吃什么补什么",
    "sentence": "奶奶常说“吃什么补什么”，我更愿意注意饮食均衡。",
    "sentence_pinyin": "Nǎi nǎi cháng shuō “chī shén me bǔ shén me”, wǒ gèng yuàn yì zhù yì yǐn shí jūn héng.",
    "sentence_english": "Grandma often says that eating a body part nourishes the corresponding part of your body, but I prefer to focus on a balanced diet."
  },
  {
    "id": "4681",
    "chinese": "拉勾",
    "sentence": "我们拉勾，说好了明天一起去公园。",
    "sentence_pinyin": "Wǒ men lā gōu, shuō hǎo le míng tiān yī qǐ qù gōng yuán.",
    "sentence_english": "We made a pinky promise to go to the park together tomorrow."
  },
  {
    "id": "4709",
    "chinese": "无障碍电梯",
    "sentence": "带着婴儿车的乘客可以使用无障碍电梯。",
    "sentence_pinyin": "Dài zhe yīng ér chē de chéng kè kě yǐ shǐ yòng wú zhàng ài diàn tī.",
    "sentence_english": "Passengers with strollers can use the accessible elevator."
  },
  {
    "id": "4715",
    "chinese": "含电子烟",
    "sentence": "禁烟标志旁边写着“含电子烟”，意思是电子烟也不能抽。",
    "sentence_pinyin": "Jìn yān biāo zhì páng biān xiě zhe “hán diàn zi yān”, yì si shì diàn zi yān yě bù néng chōu.",
    "sentence_english": "The no-smoking sign says “including e-cigarettes,” meaning they are prohibited too."
  },
  {
    "id": "4717",
    "chinese": "监督投诉电话:12345",
    "sentence": "牌子上写着“监督投诉电话：一二三四五”。",
    "sentence_pinyin": "Pái zi shàng xiě zhe “jiān dū tóu sù diàn huà: yī èr sān sì wǔ”.",
    "sentence_english": "The sign reads “Feedback and complaints phone number: 12345.”"
  },
  {
    "id": "4718",
    "chinese": "乘梯安全须知",
    "sentence": "电梯门口贴着乘梯安全须知，请先看一下。",
    "sentence_pinyin": "Diàn tī mén kǒu tiē zhe chéng tī ān quán xū zhī, qǐng xiān kàn yī xià.",
    "sentence_english": "Elevator safety instructions are posted by the doors; please read them first."
  },
  {
    "id": "4731",
    "chinese": "民警提示",
    "sentence": "公告栏上有一张民警提示，提醒大家保管好随身物品。",
    "sentence_pinyin": "Gōng gào lán shàng yǒu yī zhāng mín jǐng tí shì, tí xǐng dà jiā bǎo guǎn hǎo suí shēn wù pǐn.",
    "sentence_english": "There is a police notice on the bulletin board reminding everyone to look after their belongings."
  },
  {
    "id": "4740",
    "chinese": "临时单行道",
    "sentence": "前面正在修路，这条街今天改成了临时单行道。",
    "sentence_pinyin": "Qián miàn zhèng zài xiū lù, zhè tiáo jiē jīn tiān gǎi chéng le lín shí dān xíng dào.",
    "sentence_english": "There are roadworks ahead, so this street has become a temporary one-way road today."
  },
  {
    "id": "4745",
    "chinese": "失物领取处",
    "sentence": "如果你捡到了钱包，请把它送到失物领取处。",
    "sentence_pinyin": "Rú guǒ nǐ jiǎn dào le qián bāo, qǐng bǎ tā sòng dào shī wù lǐng qǔ chù.",
    "sentence_english": "If you find a wallet, please take it to the lost-and-found collection point."
  },
  {
    "id": "4748",
    "chinese": "灭烟处",
    "sentence": "入口旁边设有灭烟处，请先把烟熄灭再进去。",
    "sentence_pinyin": "Rù kǒu páng biān shè yǒu miè yān chù, qǐng xiān bǎ yān xī miè zài jìn qù.",
    "sentence_english": "There is a place to extinguish cigarettes beside the entrance; please put out your cigarette before entering."
  },
  {
    "id": "4750",
    "chinese": "可回收物",
    "sentence": "这个垃圾桶用来放可回收物，不要把剩饭倒进去。",
    "sentence_pinyin": "Zhè ge lā jī tǒng yòng lái fàng kě huí shōu wù, bù yào bǎ shèng fàn dào jìn qù.",
    "sentence_english": "This bin is for recyclables; do not put leftover food in it."
  },
  {
    "id": "4751",
    "chinese": "烟蒂",
    "sentence": "请不要把烟蒂扔在地上。",
    "sentence_pinyin": "Qǐng bù yào bǎ yān dì rēng zài dì shàng.",
    "sentence_english": "Please do not throw cigarette butts on the ground."
  },
  {
    "id": "4753",
    "chinese": "污染纸张",
    "sentence": "请把干净的废纸和污染纸张分开放。",
    "sentence_pinyin": "Qǐng bǎ gān jìng de fèi zhǐ hé wū rǎn zhǐ zhāng fēn kāi fàng.",
    "sentence_english": "Please keep clean waste paper separate from contaminated paper."
  },
  {
    "id": "4755",
    "chinese": "牛奶盒",
    "sentence": "喝完以后，我把牛奶盒压扁，方便收拾。",
    "sentence_pinyin": "Hē wán yǐ hòu, wǒ bǎ niú nǎi hé yā biǎn, fāng biàn shōu shí.",
    "sentence_english": "After finishing the milk, I flattened the carton to make it easier to tidy away."
  },
  {
    "id": "4756",
    "chinese": "破旧陶瓷品",
    "sentence": "整理厨房时，我们找出了几件破旧陶瓷品。",
    "sentence_pinyin": "Zhěng lǐ chú fáng shí, wǒ men zhǎo chū le jǐ jiàn pò jiù táo cí pǐn.",
    "sentence_english": "While tidying the kitchen, we found a few worn-out ceramic items."
  },
  {
    "id": "4757",
    "chinese": "一次性餐具",
    "sentence": "我点外卖时通常不选一次性餐具，因为家里有筷子。",
    "sentence_pinyin": "Wǒ diǎn wài mài shí tōng cháng bù xuǎn yī cì xìng cān jù, yīn wèi jiā lǐ yǒu kuài zi.",
    "sentence_english": "When ordering delivery, I usually skip disposable utensils because I have chopsticks at home."
  },
  {
    "id": "4760",
    "chinese": "可乐罐",
    "sentence": "他把空的可乐罐收在袋子里，准备一起拿去回收。",
    "sentence_pinyin": "Tā bǎ kōng de kě lè guàn shōu zài dài zi lǐ, zhǔn bèi yī qǐ ná qù huí shōu.",
    "sentence_english": "He collected the empty cola cans in a bag to take them for recycling together."
  },
  {
    "id": "4761",
    "chinese": "有害垃圾",
    "sentence": "这个红色垃圾桶标着“有害垃圾”。",
    "sentence_pinyin": "Zhè ge hóng sè lā jī tǒng biāo zhe “yǒu hài lā jī”.",
    "sentence_english": "This red bin is labeled “Hazardous waste.”"
  },
  {
    "id": "4762",
    "chinese": "灯管",
    "sentence": "走廊里的灯管坏了，晚上有点暗。",
    "sentence_pinyin": "Zǒu láng lǐ de dēng guǎn huài le, wǎn shàng yǒu diǎn àn.",
    "sentence_english": "The light tube in the hallway is broken, making it a little dark at night."
  },
  {
    "id": "4764",
    "chinese": "国家危险废物名录中的家庭源危险废物,包括灯管、家用化学品和电池等",
    "sentence": "这份说明列出了家庭源危险废物的例子，包括灯管、家用化学品和电池等。",
    "sentence_pinyin": "Zhè fèn shuō míng liè chū le jiā tíng yuán wēi xiǎn fèi wù de lì zi, bāo kuò dēng guǎn, jiā yòng huà xué pǐn hé diàn chí děng.",
    "sentence_english": "These instructions list examples of hazardous household waste, including light tubes, household chemicals, and batteries."
  },
  {
    "id": "4768",
    "chinese": "派出所报警电话:110",
    "sentence": "告示上的报警电话是一一零，下面还写着派出所的地址。",
    "sentence_pinyin": "Gào shì shàng de bào jǐng diàn huà shì yī yī líng, xià miàn hái xiě zhe pài chū suǒ de dì zhǐ.",
    "sentence_english": "The emergency police number on the notice is 110, and the police station's address is written below it."
  },
  {
    "id": "4777",
    "chinese": "24小时视频监控",
    "sentence": "入口处贴着“二十四小时视频监控”的提示。",
    "sentence_pinyin": "Rù kǒu chù tiē zhe “èr shí sì xiǎo shí shì pín jiān kòng” de tí shì.",
    "sentence_english": "There is a “24-hour video surveillance” notice at the entrance."
  },
  {
    "id": "4785",
    "chinese": "便捷换乘",
    "sentence": "这座车站可以便捷换乘地铁和公交车。",
    "sentence_pinyin": "Zhè zuò chē zhàn kě yǐ biàn jié huàn chéng dì tiě hé gōng jiāo chē.",
    "sentence_english": "At this station, you can easily transfer between the metro and buses."
  },
  {
    "id": "4788",
    "chinese": "最大负荷:25kg",
    "sentence": "架子上标着“最大负荷二十五公斤”，别放太重的东西。",
    "sentence_pinyin": "Jià zi shàng biāo zhe “zuì dà fù hè èr shí wǔ gōng jīn”, bié fàng tài zhòng de dōng xī.",
    "sentence_english": "The rack is marked “Maximum load: 25 kilograms”; do not put anything too heavy on it."
  },
  {
    "id": "4795",
    "chinese": "农副产品自售点",
    "sentence": "村口的农副产品自售点卖蔬菜和鸡蛋。",
    "sentence_pinyin": "Cūn kǒu de nóng fù chǎn pǐn zì shòu diǎn mài shū cài hé jī dàn.",
    "sentence_english": "The farm-products sales stall at the village entrance sells vegetables and eggs."
  },
  {
    "id": "4796",
    "chinese": "耗能低",
    "sentence": "我想买一台耗能低的冰箱，长期用起来更省电。",
    "sentence_pinyin": "Wǒ xiǎng mǎi yī tái hào néng dī de bīng xiāng, cháng qī yòng qǐ lái gèng shěng diàn.",
    "sentence_english": "I want a fridge that uses little energy and will save electricity over time."
  },
  {
    "id": "4797",
    "chinese": "耗能高",
    "sentence": "这台旧空调耗能高，我正在考虑换一台。",
    "sentence_pinyin": "Zhè tái jiù kōng tiáo hào néng gāo, wǒ zhèng zài kǎo lǜ huàn yī tái.",
    "sentence_english": "This old air conditioner uses a lot of energy, and I am considering replacing it."
  },
  {
    "id": "4799",
    "chinese": "规格型号",
    "sentence": "买配件之前，先确认机器的规格型号。",
    "sentence_pinyin": "Mǎi pèi jiàn zhī qián, xiān què rèn jī qì de guī gé xíng hào.",
    "sentence_english": "Before buying parts, check the machine's specifications and model."
  },
  {
    "id": "4800",
    "chinese": "综合耗电量(千瓦时/24小时)",
    "sentence": "这台冰箱的综合耗电量按每二十四小时多少千瓦时来标注。",
    "sentence_pinyin": "Zhè tái bīng xiāng de zōng hé hào diàn liàng àn měi èr shí sì xiǎo shí duō shǎo qiān wǎ shí lái biāo zhù.",
    "sentence_english": "This fridge's overall electricity consumption is labeled in kilowatt-hours per twenty-four hours."
  },
  {
    "id": "4801",
    "chinese": "冷藏室容积(升)",
    "sentence": "这台冰箱的冷藏室容积是两百升，够我们一家人用。",
    "sentence_pinyin": "Zhè tái bīng xiāng de lěng cáng shì róng jī shì liǎng bǎi shēng, gòu wǒ men yī jiā rén yòng.",
    "sentence_english": "This fridge's refrigerated compartment has a capacity of two hundred liters, enough for our family."
  },
  {
    "id": "4802",
    "chinese": "冷冻室容积(升)",
    "sentence": "买冰箱时，我更关心冷冻室容积，因为我常买冷冻食品。",
    "sentence_pinyin": "Mǎi bīng xiāng shí, wǒ gèng guān xīn lěng dòng shì róng jī, yīn wèi wǒ cháng mǎi lěng dòng shí pǐn.",
    "sentence_english": "When buying a fridge, I care more about freezer capacity because I often buy frozen food."
  },
  {
    "id": "4806",
    "chinese": "紧急呼叫电话",
    "sentence": "电梯里有紧急呼叫电话，遇到故障时可以用它求助。",
    "sentence_pinyin": "Diàn tī lǐ yǒu jǐn jí hū jiào diàn huà, yù dào gù zhàng shí kě yǐ yòng tā qiú zhù.",
    "sentence_english": "There is an emergency call phone in the elevator that you can use to ask for help if it breaks down."
  },
  {
    "id": "4809",
    "chinese": "失物招领架",
    "sentence": "我在失物招领架上找到了昨天忘带走的雨伞。",
    "sentence_pinyin": "Wǒ zài shī wù zhāo lǐng jià shàng zhǎo dào le zuó tiān wàng dài zǒu de yǔ sǎn.",
    "sentence_english": "I found the umbrella I had left behind yesterday on the lost-and-found shelf."
  },
  {
    "id": "4963",
    "chinese": "境外人员住宿登记凭证",
    "sentence": "工作人员给了我一张境外人员住宿登记凭证，让我收好。",
    "sentence_pinyin": "Gōng zuò rén yuán gěi le wǒ yī zhāng jìng wài rén yuán zhù sù dēng jì píng zhèng, ràng wǒ shōu hǎo.",
    "sentence_english": "The staff member gave me an accommodation registration slip for overseas visitors and told me to keep it safe."
  },
  {
    "id": "5373",
    "chinese": "如果你能活到九十岁, 并在最后六十年里保留三十岁的心智或身体",
    "sentence": "如果你能活到九十岁，并在最后六十年里保留三十岁的心智或身体，你会选择哪一个？",
    "sentence_pinyin": "Rú guǒ nǐ néng huó dào jiǔ shí suì, bìng zài zuì hòu liù shí nián lǐ bǎo liú sān shí suì de xīn zhì huò shēn tǐ, nǐ huì xuǎn zé nǎ yī gè?",
    "sentence_english": "If you could live to ninety and retain either a thirty-year-old's mind or body for the final sixty years, which would you choose?"
  }
]
$examples$::jsonb) AS e(
    id text, chinese text, sentence text, sentence_pinyin text, sentence_english text
  )
)
UPDATE public.study_content AS content
SET payload = content.payload || jsonb_build_object(
      'sentence', e.sentence,
      'sentence_pinyin', e.sentence_pinyin,
      'sentence_english', e.sentence_english
    ),
    updated_at = now()
FROM examples AS e
WHERE content.id = 'word:' || e.id
  AND content.kind = 'word'
  AND content.payload->>'chinese' = e.chinese
  AND coalesce(btrim(content.payload->>'sentence'), '') IN ('', '-')
  AND coalesce(btrim(content.payload->>'sentence_pinyin'), '') IN ('', '-')
  AND coalesce(btrim(content.payload->>'sentence_english'), '') IN ('', '-')
RETURNING content.id, content.payload->>'chinese' AS chinese;
COMMIT;
