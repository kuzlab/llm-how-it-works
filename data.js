// LLM の仕組み体験アプリ ― データ定義
// すべての確率配列 prob は合計 1.0（基準分布。温度 1.0 のときに表示される形）。
window.APP_DATA = {
  // --- タブ1: 見本文と、各ステップの「次の単語」候補テーブル -----------------
  sentences: [
    {
      id: "weather",
      title: "今日の天気の話",
      prompt: "今日は天気が",
      steps: [
        {
          context: "今日は天気が",
          candidates: [
            { token: "いい",   prob: 0.55 },
            { token: "悪い",   prob: 0.20 },
            { token: "良くて", prob: 0.12 },
            { token: "不安定", prob: 0.08 },
            { token: "微妙",   prob: 0.05 }
          ],
          chosen: "いい",
          branches: {
            "悪い": [
              {
                context: "今日は天気が悪い",
                candidates: [
                  { token: "から",   prob: 0.40 },
                  { token: "ので",   prob: 0.35 },
                  { token: "けど",   prob: 0.15 },
                  { token: "し",     prob: 0.07 },
                  { token: "が",     prob: 0.03 }
                ],
                chosen: "から"
              },
              {
                context: "今日は天気が悪いから",
                candidates: [
                  { token: "家",       prob: 0.35 },
                  { token: "部屋",     prob: 0.20 },
                  { token: "外出",     prob: 0.15 },
                  { token: "ゴロゴロ", prob: 0.15 },
                  { token: "散歩",     prob: 0.15 }
                ],
                chosen: "家"
              },
              {
                context: "今日は天気が悪いから家",
                candidates: [
                  { token: "で",     prob: 0.55 },
                  { token: "に",     prob: 0.30 },
                  { token: "でも",   prob: 0.10 },
                  { token: "でね",   prob: 0.03 },
                  { token: "から",   prob: 0.02 }
                ],
                chosen: "で"
              },
              {
                context: "今日は天気が悪いから家で",
                candidates: [
                  { token: "ゴロゴロ", prob: 0.35 },
                  { token: "読書",     prob: 0.25 },
                  { token: "過ごそう", prob: 0.20 },
                  { token: "寝よう",   prob: 0.12 },
                  { token: "仕事",     prob: 0.08 }
                ],
                chosen: "ゴロゴロ"
              },
              {
                context: "今日は天気が悪いから家でゴロゴロ",
                candidates: [
                  { token: "しよう",   prob: 0.55 },
                  { token: "する",     prob: 0.25 },
                  { token: "してる",   prob: 0.10 },
                  { token: "したい",   prob: 0.07 },
                  { token: "しよう。", prob: 0.03 }
                ],
                chosen: "しよう"
              }
            ]
          }
        },
        {
          context: "今日は天気がいい",
          candidates: [
            { token: "から", prob: 0.40 },
            { token: "ので", prob: 0.25 },
            { token: "ね",   prob: 0.15 },
            { token: "です", prob: 0.12 },
            { token: "。",   prob: 0.08 }
          ],
          chosen: "から"
        },
        {
          context: "今日は天気がいいから",
          candidates: [
            { token: "散歩",   prob: 0.30 },
            { token: "出かけ", prob: 0.22 },
            { token: "公園",   prob: 0.20 },
            { token: "外",     prob: 0.16 },
            { token: "洗濯",   prob: 0.12 }
          ],
          chosen: "散歩"
        },
        {
          context: "今日は天気がいいから散歩",
          candidates: [
            { token: "に",   prob: 0.50 },
            { token: "へ",   prob: 0.25 },
            { token: "でも", prob: 0.15 },
            { token: "が",   prob: 0.07 },
            { token: "を",   prob: 0.03 }
          ],
          chosen: "に"
        },
        {
          context: "今日は天気がいいから散歩に",
          candidates: [
            { token: "行こう",     prob: 0.40 },
            { token: "行きたい",   prob: 0.30 },
            { token: "出かけよう", prob: 0.20 },
            { token: "行く",       prob: 0.07 },
            { token: "出る",       prob: 0.03 }
          ],
          chosen: "行こう"
        }
      ]
    },

    {
      id: "fairytale",
      title: "昔話のはじまり",
      prompt: "むかしむかし、あるところに",
      steps: [
        {
          context: "むかしむかし、あるところに",
          candidates: [
            { token: "おじいさん", prob: 0.45 },
            { token: "おばあさん", prob: 0.30 },
            { token: "お城",       prob: 0.10 },
            { token: "王様",       prob: 0.10 },
            { token: "猫",         prob: 0.05 }
          ],
          chosen: "おじいさん",
          branches: {
            "猫": [
              {
                context: "むかしむかし、あるところに猫",
                candidates: [
                  { token: "が", prob: 0.55 },
                  { token: "と", prob: 0.20 },
                  { token: "の", prob: 0.10 },
                  { token: "は", prob: 0.10 },
                  { token: "、", prob: 0.05 }
                ],
                chosen: "が"
              },
              {
                context: "むかしむかし、あるところに猫が",
                candidates: [
                  { token: "住んで",   prob: 0.40 },
                  { token: "住み",     prob: 0.25 },
                  { token: "暮らして", prob: 0.20 },
                  { token: "いて",     prob: 0.10 },
                  { token: "一匹",     prob: 0.05 }
                ],
                chosen: "住んで"
              },
              {
                context: "むかしむかし、あるところに猫が住んで",
                candidates: [
                  { token: "いました",   prob: 0.65 },
                  { token: "おりました", prob: 0.20 },
                  { token: "いる",       prob: 0.07 },
                  { token: "いた",       prob: 0.05 },
                  { token: "い",         prob: 0.03 }
                ],
                chosen: "いました"
              }
            ]
          }
        },
        {
          context: "むかしむかし、あるところにおじいさん",
          candidates: [
            { token: "と", prob: 0.50 },
            { token: "が", prob: 0.30 },
            { token: "は", prob: 0.10 },
            { token: "、", prob: 0.07 },
            { token: "の", prob: 0.03 }
          ],
          chosen: "と"
        },
        {
          context: "むかしむかし、あるところにおじいさんと",
          candidates: [
            { token: "おばあさん", prob: 0.70 },
            { token: "仲間",       prob: 0.10 },
            { token: "旅人",       prob: 0.08 },
            { token: "動物",       prob: 0.08 },
            { token: "子ども",     prob: 0.04 }
          ],
          chosen: "おばあさん"
        },
        {
          context: "むかしむかし、あるところにおじいさんとおばあさん",
          candidates: [
            { token: "が", prob: 0.55 },
            { token: "と", prob: 0.20 },
            { token: "は", prob: 0.15 },
            { token: "、", prob: 0.07 },
            { token: "で", prob: 0.03 }
          ],
          chosen: "が"
        },
        {
          context: "むかしむかし、あるところにおじいさんとおばあさんが",
          candidates: [
            { token: "住んで",     prob: 0.40 },
            { token: "暮らして",   prob: 0.35 },
            { token: "いて",       prob: 0.10 },
            { token: "おりまして", prob: 0.10 },
            { token: "仲良く",     prob: 0.05 }
          ],
          chosen: "住んで"
        },
        {
          context: "むかしむかし、あるところにおじいさんとおばあさんが住んで",
          candidates: [
            { token: "いました",   prob: 0.60 },
            { token: "おりました", prob: 0.25 },
            { token: "いる",       prob: 0.08 },
            { token: "い",         prob: 0.05 },
            { token: "いた",       prob: 0.02 }
          ],
          chosen: "いました"
        }
      ]
    },

    {
      id: "coffee",
      title: "温度の違いがよく分かる例",
      prompt: "コーヒーに合うのは",
      steps: [
        {
          context: "コーヒーに合うのは",
          candidates: [
            { token: "ケーキ",   prob: 0.30 },
            { token: "チョコ",   prob: 0.25 },
            { token: "クッキー", prob: 0.22 },
            { token: "ドーナツ", prob: 0.18 },
            { token: "塩",       prob: 0.05 }
          ],
          chosen: "ケーキ",
          branches: {
            "塩": [
              {
                context: "コーヒーに合うのは塩",
                candidates: [
                  { token: "なんて",   prob: 0.35 },
                  { token: "だ",       prob: 0.20 },
                  { token: "です",     prob: 0.20 },
                  { token: "と",       prob: 0.15 },
                  { token: "、",       prob: 0.10 }
                ],
                chosen: "なんて"
              },
              {
                context: "コーヒーに合うのは塩なんて",
                candidates: [
                  { token: "信じられない",         prob: 0.35 },
                  { token: "言う",                 prob: 0.25 },
                  { token: "思う",                 prob: 0.20 },
                  { token: "変わってる",           prob: 0.15 },
                  { token: "聞いたことない",       prob: 0.05 }
                ],
                chosen: "信じられない"
              }
            ]
          }
        },
        {
          context: "コーヒーに合うのはケーキ",
          candidates: [
            { token: "です",   prob: 0.35 },
            { token: "だ",     prob: 0.30 },
            { token: "だろう", prob: 0.15 },
            { token: "かな",   prob: 0.12 },
            { token: "。",     prob: 0.08 }
          ],
          chosen: "です"
        },
        {
          context: "コーヒーに合うのはケーキです",
          candidates: [
            { token: "ね", prob: 0.50 },
            { token: "よ", prob: 0.25 },
            { token: "。", prob: 0.15 },
            { token: "が", prob: 0.05 },
            { token: "か", prob: 0.05 }
          ],
          chosen: "ね"
        }
      ]
    },

    {
      id: "fuji",
      title: "説明文(富士山)",
      prompt: "富士山は日本で",
      steps: [
        {
          context: "富士山は日本で",
          candidates: [
            { token: "一番",     prob: 0.50 },
            { token: "最も",     prob: 0.30 },
            { token: "最高",     prob: 0.10 },
            { token: "二番目",   prob: 0.05 },
            { token: "三番目",   prob: 0.05 }
          ],
          chosen: "一番"
        },
        {
          context: "富士山は日本で一番",
          candidates: [
            { token: "高い",     prob: 0.65 },
            { token: "大きな",   prob: 0.15 },
            { token: "有名な",   prob: 0.10 },
            { token: "美しい",   prob: 0.07 },
            { token: "古い",     prob: 0.03 }
          ],
          chosen: "高い"
        },
        {
          context: "富士山は日本で一番高い",
          candidates: [
            { token: "山",     prob: 0.70 },
            { token: "山岳",   prob: 0.10 },
            { token: "名峰",   prob: 0.10 },
            { token: "火山",   prob: 0.07 },
            { token: "場所",   prob: 0.03 }
          ],
          chosen: "山"
        },
        {
          context: "富士山は日本で一番高い山",
          candidates: [
            { token: "です",     prob: 0.55 },
            { token: "だ",       prob: 0.25 },
            { token: "。",       prob: 0.10 },
            { token: "であり",   prob: 0.07 },
            { token: "ね",       prob: 0.03 }
          ],
          chosen: "です"
        },
        {
          context: "富士山は日本で一番高い山です",
          candidates: [
            { token: "。",   prob: 0.70 },
            { token: "ね",   prob: 0.15 },
            { token: "よ",   prob: 0.10 },
            { token: "が",   prob: 0.03 },
            { token: "から", prob: 0.02 }
          ],
          chosen: "。"
        }
      ]
    },

    {
      id: "nightsky",
      title: "詩的な文(夜空)",
      prompt: "夜空に",
      steps: [
        {
          context: "夜空に",
          candidates: [
            { token: "星", prob: 0.40 },
            { token: "月", prob: 0.30 },
            { token: "光", prob: 0.15 },
            { token: "雲", prob: 0.10 },
            { token: "風", prob: 0.05 }
          ],
          chosen: "星"
        },
        {
          context: "夜空に星",
          candidates: [
            { token: "が",   prob: 0.50 },
            { token: "の",   prob: 0.25 },
            { token: "たち", prob: 0.15 },
            { token: "は",   prob: 0.07 },
            { token: "を",   prob: 0.03 }
          ],
          chosen: "が"
        },
        {
          context: "夜空に星が",
          candidates: [
            { token: "きらきらと", prob: 0.30 },
            { token: "静かに",     prob: 0.28 },
            { token: "まばらに",   prob: 0.18 },
            { token: "無数に",     prob: 0.14 },
            { token: "寂しく",     prob: 0.10 }
          ],
          chosen: "きらきらと"
        },
        {
          context: "夜空に星がきらきらと",
          candidates: [
            { token: "輝いて", prob: 0.45 },
            { token: "光って", prob: 0.35 },
            { token: "瞬いて", prob: 0.12 },
            { token: "流れて", prob: 0.05 },
            { token: "笑って", prob: 0.03 }
          ],
          chosen: "輝いて"
        },
        {
          context: "夜空に星がきらきらと輝いて",
          candidates: [
            { token: "いる",     prob: 0.50 },
            { token: "いた",     prob: 0.25 },
            { token: "いました", prob: 0.15 },
            { token: "る",       prob: 0.07 },
            { token: "。",       prob: 0.03 }
          ],
          chosen: "いる"
        }
      ]
    },

    {
      id: "morning",
      title: "日常会話(明日の朝)",
      prompt: "明日の朝は",
      steps: [
        {
          context: "明日の朝は",
          candidates: [
            { token: "早く",     prob: 0.40 },
            { token: "早起き",   prob: 0.30 },
            { token: "パン",     prob: 0.10 },
            { token: "コーヒー", prob: 0.10 },
            { token: "ヨガ",     prob: 0.10 }
          ],
          chosen: "早く"
        },
        {
          context: "明日の朝は早く",
          candidates: [
            { token: "起き",       prob: 0.55 },
            { token: "出かけ",     prob: 0.25 },
            { token: "行こう",     prob: 0.10 },
            { token: "起きよう",   prob: 0.07 },
            { token: "目覚め",     prob: 0.03 }
          ],
          chosen: "起き"
        },
        {
          context: "明日の朝は早く起き",
          candidates: [
            { token: "なきゃ", prob: 0.30 },
            { token: "よう",   prob: 0.28 },
            { token: "たい",   prob: 0.20 },
            { token: "る",     prob: 0.15 },
            { token: "て",     prob: 0.07 }
          ],
          chosen: "なきゃ"
        },
        {
          context: "明日の朝は早く起きなきゃ",
          candidates: [
            { token: "いけない", prob: 0.40 },
            { token: "。",       prob: 0.30 },
            { token: "ね",       prob: 0.15 },
            { token: "な",       prob: 0.10 },
            { token: "よ",       prob: 0.05 }
          ],
          chosen: "いけない"
        }
      ]
    },

    {
      id: "lowprob",
      title: "意外な選択(雨の日)",
      prompt: "雨の日に",
      steps: [
        {
          context: "雨の日に",
          candidates: [
            { token: "傘",     prob: 0.50 },
            { token: "家",     prob: 0.25 },
            { token: "カフェ", prob: 0.10 },
            { token: "読書",   prob: 0.10 },
            { token: "走る",   prob: 0.05 }
          ],
          // ※ あえて確率の低い候補を選ばせている見本(LLMはたまにこういう道も通る)
          chosen: "走る"
        },
        {
          context: "雨の日に走る",
          candidates: [
            { token: "の",       prob: 0.30 },
            { token: "が",       prob: 0.25 },
            { token: "と",       prob: 0.20 },
            { token: "なんて",   prob: 0.15 },
            { token: "って",     prob: 0.10 }
          ],
          chosen: "なんて"
        },
        {
          context: "雨の日に走るなんて",
          candidates: [
            { token: "最高",         prob: 0.40 },
            { token: "楽しい",       prob: 0.30 },
            { token: "クレイジー",   prob: 0.15 },
            { token: "気持ちいい",   prob: 0.10 },
            { token: "変",           prob: 0.05 }
          ],
          chosen: "気持ちいい"
        }
      ]
    }
  ],

  // --- タブ4: 両側から考える(BERT 風) ----------------------------------------
  // 同じ穴あき文に対して「左だけ見たとき」と「両側見たとき」の分布を比較する。
  // 各候補配列の prob 合計は 1.0。
  bert: [
    {
      id: "weather",
      title: "天気の話",
      left: "今日は天気が",
      right: "から散歩に行こう",
      leftOnly: [
        { token: "いい",     prob: 0.30 },
        { token: "悪い",     prob: 0.20 },
        { token: "良くて",   prob: 0.15 },
        { token: "晴れて",   prob: 0.12 },
        { token: "微妙",     prob: 0.10 },
        { token: "不安定",   prob: 0.08 },
        { token: "曇って",   prob: 0.05 }
      ],
      bidirectional: [
        { token: "いい",     prob: 0.78 },
        { token: "良くて",   prob: 0.12 },
        { token: "晴れて",   prob: 0.07 },
        { token: "悪い",     prob: 0.01 },
        { token: "曇って",   prob: 0.01 },
        { token: "微妙",     prob: 0.01 },
        { token: "不安定",   prob: 0.00 }
      ]
    },
    {
      id: "fairytale",
      title: "昔話",
      left: "むかしむかし、あるところに",
      right: "とおばあさんが住んでいました",
      leftOnly: [
        { token: "おじいさん", prob: 0.30 },
        { token: "若者",       prob: 0.15 },
        { token: "王様",       prob: 0.12 },
        { token: "旅人",       prob: 0.10 },
        { token: "猫",         prob: 0.10 },
        { token: "おばあさん", prob: 0.08 },
        { token: "お姫様",     prob: 0.08 },
        { token: "農夫",       prob: 0.07 }
      ],
      bidirectional: [
        { token: "おじいさん", prob: 0.88 },
        { token: "若者",       prob: 0.04 },
        { token: "農夫",       prob: 0.03 },
        { token: "王様",       prob: 0.02 },
        { token: "旅人",       prob: 0.02 },
        { token: "猫",         prob: 0.01 },
        { token: "お姫様",     prob: 0.00 },
        { token: "おばあさん", prob: 0.00 }
      ]
    },
    {
      id: "sweets",
      title: "甘いもの",
      left: "甘い",
      right: "を食べながら、苦いコーヒーを飲む",
      leftOnly: [
        { token: "ケーキ", prob: 0.18 },
        { token: "果物",   prob: 0.15 },
        { token: "リンゴ", prob: 0.12 },
        { token: "チョコ", prob: 0.10 },
        { token: "ジャム", prob: 0.10 },
        { token: "プリン", prob: 0.10 },
        { token: "言葉",   prob: 0.10 },
        { token: "香り",   prob: 0.08 },
        { token: "歌",     prob: 0.07 }
      ],
      bidirectional: [
        { token: "ケーキ", prob: 0.42 },
        { token: "チョコ", prob: 0.22 },
        { token: "プリン", prob: 0.15 },
        { token: "リンゴ", prob: 0.10 },
        { token: "ジャム", prob: 0.08 },
        { token: "果物",   prob: 0.02 },
        { token: "香り",   prob: 0.01 },
        { token: "言葉",   prob: 0.00 },
        { token: "歌",     prob: 0.00 }
      ]
    }
  ],

  // --- タブ2: トークン分解(事前に焼き込み) ---------------------------------
  tokenization: [
    {
      id: "ja-1",
      lang: "日本語",
      text: "今日はいい天気ですね",
      tokens: [
        { text: "今日", id: 1024 },
        { text: "は",   id: 7 },
        { text: "いい", id: 833 },
        { text: "天気", id: 2901 },
        { text: "です", id: 41 },
        { text: "ね",   id: 12 }
      ]
    },
    {
      id: "en-1",
      lang: "英語",
      text: "It is a nice day",
      tokens: [
        { text: "It",    id: 1026 },
        { text: " is",   id: 318 },
        { text: " a",    id: 257 },
        { text: " nice", id: 3621 },
        { text: " day",  id: 1110 }
      ]
    },
    {
      id: "ja-2",
      lang: "日本語",
      text: "美術館に行きたい",
      tokens: [
        { text: "美術", id: 4501 },
        { text: "館",   id: 932 },
        { text: "に",   id: 9 },
        { text: "行き", id: 1872 },
        { text: "たい", id: 511 }
      ]
    },
    {
      id: "en-2",
      lang: "英語",
      text: "I want to go to a museum",
      tokens: [
        { text: "I",       id: 40 },
        { text: " want",   id: 765 },
        { text: " to",     id: 284 },
        { text: " go",     id: 467 },
        { text: " to",     id: 284 },
        { text: " a",      id: 257 },
        { text: " museum", id: 14730 }
      ]
    }
  ],

  // --- タブ3: 意味の地図 -----------------------------------------------------
  meaningMap: {
    categories: [
      { id: "animal",  label: "動物",     color: "#E07A5F" },
      { id: "food",    label: "食べもの", color: "#81B29A" },
      { id: "emotion", label: "感情",     color: "#F2CC8F" },
      { id: "color",   label: "色",       color: "#6D83F2" }
    ],
    // x, y は 0〜100 の地図上の座標。同カテゴリは固まり、別カテゴリは離れる。
    words: [
      // 動物(左上) ----
      { word: "犬",       category: "animal",  x: 18, y: 22 },
      { word: "猫",       category: "animal",  x: 24, y: 16 },
      { word: "うさぎ",   category: "animal",  x: 12, y: 30 },
      { word: "馬",       category: "animal",  x: 28, y: 28 },
      { word: "鳥",       category: "animal",  x: 10, y: 18 },
      { word: "魚",       category: "animal",  x: 16, y: 32 },
      { word: "ぞう",     category: "animal",  x: 22, y: 24 },
      { word: "ライオン", category: "animal",  x: 26, y: 12 },
      // 食べもの(右上) ----
      { word: "りんご",   category: "food",    x: 78, y: 20 },
      { word: "パン",     category: "food",    x: 85, y: 28 },
      { word: "ケーキ",   category: "food",    x: 72, y: 14 },
      { word: "ごはん",   category: "food",    x: 88, y: 22 },
      { word: "カレー",   category: "food",    x: 76, y: 30 },
      { word: "すし",     category: "food",    x: 82, y: 12 },
      { word: "パスタ",   category: "food",    x: 68, y: 24 },
      { word: "アイス",   category: "food",    x: 74, y: 34 },
      // 感情(左下) ----
      { word: "うれしい", category: "emotion", x: 20, y: 78 },
      { word: "かなしい", category: "emotion", x: 14, y: 86 },
      { word: "こわい",   category: "emotion", x: 26, y: 84 },
      { word: "たのしい", category: "emotion", x: 18, y: 70 },
      { word: "いかり",   category: "emotion", x: 12, y: 72 },
      { word: "おどろき", category: "emotion", x: 28, y: 76 },
      { word: "やすらぎ", category: "emotion", x: 8,  y: 84 },
      // 色(右下) ----
      { word: "あか",     category: "color",   x: 80, y: 80 },
      { word: "あお",     category: "color",   x: 86, y: 74 },
      { word: "みどり",   category: "color",   x: 76, y: 88 },
      { word: "きいろ",   category: "color",   x: 88, y: 82 },
      { word: "しろ",     category: "color",   x: 70, y: 70 },
      { word: "くろ",     category: "color",   x: 84, y: 88 },
      { word: "ピンク",   category: "color",   x: 72, y: 76 }
    ]
  }
};
