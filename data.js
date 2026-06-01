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
            "良くて": [
              {
                context: "今日は天気が良くて",
                candidates: [
                  { token: "気持ち",   prob: 0.40 },
                  { token: "散歩",     prob: 0.25 },
                  { token: "嬉しい",   prob: 0.15 },
                  { token: "助かる",   prob: 0.12 },
                  { token: "楽しい",   prob: 0.08 }
                ],
                chosen: "気持ち"
              },
              {
                context: "今日は天気が良くて気持ち",
                candidates: [
                  { token: "が",   prob: 0.55 },
                  { token: "の",   prob: 0.20 },
                  { token: "いい", prob: 0.10 },
                  { token: "だ",   prob: 0.10 },
                  { token: "よく", prob: 0.05 }
                ],
                chosen: "が"
              },
              {
                context: "今日は天気が良くて気持ちが",
                candidates: [
                  { token: "いい",     prob: 0.65 },
                  { token: "良い",     prob: 0.20 },
                  { token: "軽い",     prob: 0.08 },
                  { token: "すっきり", prob: 0.05 },
                  { token: "弾む",     prob: 0.02 }
                ],
                chosen: "いい"
              }
            ],
            "不安定": [
              {
                context: "今日は天気が不安定",
                candidates: [
                  { token: "だ",       prob: 0.40 },
                  { token: "で",       prob: 0.25 },
                  { token: "な",       prob: 0.20 },
                  { token: "だから",   prob: 0.10 },
                  { token: "、",       prob: 0.05 }
                ],
                chosen: "だ"
              },
              {
                context: "今日は天気が不安定だ",
                candidates: [
                  { token: "ね",   prob: 0.50 },
                  { token: "から", prob: 0.25 },
                  { token: "。",   prob: 0.15 },
                  { token: "よ",   prob: 0.07 },
                  { token: "わ",   prob: 0.03 }
                ],
                chosen: "ね"
              }
            ],
            "微妙": [
              {
                context: "今日は天気が微妙",
                candidates: [
                  { token: "で",       prob: 0.40 },
                  { token: "だ",       prob: 0.25 },
                  { token: "な",       prob: 0.15 },
                  { token: "だね",     prob: 0.12 },
                  { token: "だから",   prob: 0.08 }
                ],
                chosen: "で"
              },
              {
                context: "今日は天気が微妙で",
                candidates: [
                  { token: "困る",         prob: 0.40 },
                  { token: "心配",         prob: 0.25 },
                  { token: "嫌だ",         prob: 0.15 },
                  { token: "どうしよう",   prob: 0.12 },
                  { token: "残念",         prob: 0.08 }
                ],
                chosen: "困る"
              }
            ],
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
            "おばあさん": [
              {
                context: "むかしむかし、あるところにおばあさん",
                candidates: [
                  { token: "が", prob: 0.55 },
                  { token: "と", prob: 0.25 },
                  { token: "の", prob: 0.10 },
                  { token: "は", prob: 0.07 },
                  { token: "、", prob: 0.03 }
                ],
                chosen: "が"
              },
              {
                context: "むかしむかし、あるところにおばあさんが",
                candidates: [
                  { token: "住んで",       prob: 0.40 },
                  { token: "一人",         prob: 0.25 },
                  { token: "暮らして",     prob: 0.20 },
                  { token: "おりまして",   prob: 0.10 },
                  { token: "いて",         prob: 0.05 }
                ],
                chosen: "住んで"
              },
              {
                context: "むかしむかし、あるところにおばあさんが住んで",
                candidates: [
                  { token: "いました",     prob: 0.65 },
                  { token: "おりました",   prob: 0.20 },
                  { token: "いる",         prob: 0.08 },
                  { token: "いた",         prob: 0.05 },
                  { token: "い",           prob: 0.02 }
                ],
                chosen: "いました"
              }
            ],
            "お城": [
              {
                context: "むかしむかし、あるところにお城",
                candidates: [
                  { token: "が", prob: 0.55 },
                  { token: "と", prob: 0.15 },
                  { token: "の", prob: 0.15 },
                  { token: "で", prob: 0.10 },
                  { token: "に", prob: 0.05 }
                ],
                chosen: "が"
              },
              {
                context: "むかしむかし、あるところにお城が",
                candidates: [
                  { token: "ありました", prob: 0.50 },
                  { token: "あって",     prob: 0.25 },
                  { token: "建って",     prob: 0.15 },
                  { token: "そびえて",   prob: 0.07 },
                  { token: "一つ",       prob: 0.03 }
                ],
                chosen: "ありました"
              }
            ],
            "王様": [
              {
                context: "むかしむかし、あるところに王様",
                candidates: [
                  { token: "と", prob: 0.40 },
                  { token: "が", prob: 0.35 },
                  { token: "の", prob: 0.10 },
                  { token: "は", prob: 0.10 },
                  { token: "、", prob: 0.05 }
                ],
                chosen: "と"
              },
              {
                context: "むかしむかし、あるところに王様と",
                candidates: [
                  { token: "お姫様",   prob: 0.45 },
                  { token: "お妃様",   prob: 0.25 },
                  { token: "家来",     prob: 0.15 },
                  { token: "子ども",   prob: 0.10 },
                  { token: "大臣",     prob: 0.05 }
                ],
                chosen: "お姫様"
              },
              {
                context: "むかしむかし、あるところに王様とお姫様",
                candidates: [
                  { token: "が", prob: 0.60 },
                  { token: "と", prob: 0.20 },
                  { token: "は", prob: 0.10 },
                  { token: "、", prob: 0.07 },
                  { token: "の", prob: 0.03 }
                ],
                chosen: "が"
              },
              {
                context: "むかしむかし、あるところに王様とお姫様が",
                candidates: [
                  { token: "住んで",       prob: 0.45 },
                  { token: "暮らして",     prob: 0.30 },
                  { token: "おりました",   prob: 0.10 },
                  { token: "いて",         prob: 0.10 },
                  { token: "いました",     prob: 0.05 }
                ],
                chosen: "住んで"
              },
              {
                context: "むかしむかし、あるところに王様とお姫様が住んで",
                candidates: [
                  { token: "いました",     prob: 0.65 },
                  { token: "おりました",   prob: 0.20 },
                  { token: "いる",         prob: 0.07 },
                  { token: "いた",         prob: 0.05 },
                  { token: "い",           prob: 0.03 }
                ],
                chosen: "いました"
              }
            ],
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
            "チョコ": [
              {
                context: "コーヒーに合うのはチョコ",
                candidates: [
                  { token: "だ",     prob: 0.35 },
                  { token: "です",   prob: 0.25 },
                  { token: "だね",   prob: 0.20 },
                  { token: "かな",   prob: 0.12 },
                  { token: "。",     prob: 0.08 }
                ],
                chosen: "だ"
              },
              {
                context: "コーヒーに合うのはチョコだ",
                candidates: [
                  { token: "と", prob: 0.50 },
                  { token: "ね", prob: 0.20 },
                  { token: "。", prob: 0.15 },
                  { token: "よ", prob: 0.10 },
                  { token: "な", prob: 0.05 }
                ],
                chosen: "と"
              },
              {
                context: "コーヒーに合うのはチョコだと",
                candidates: [
                  { token: "思う",         prob: 0.50 },
                  { token: "言う",         prob: 0.25 },
                  { token: "信じる",       prob: 0.10 },
                  { token: "個人的に",     prob: 0.10 },
                  { token: "確信",         prob: 0.05 }
                ],
                chosen: "思う"
              }
            ],
            "クッキー": [
              {
                context: "コーヒーに合うのはクッキー",
                candidates: [
                  { token: "だ",     prob: 0.40 },
                  { token: "です",   prob: 0.30 },
                  { token: "かな",   prob: 0.15 },
                  { token: "だね",   prob: 0.10 },
                  { token: "。",     prob: 0.05 }
                ],
                chosen: "だ"
              },
              {
                context: "コーヒーに合うのはクッキーだ",
                candidates: [
                  { token: "な",   prob: 0.45 },
                  { token: "ね",   prob: 0.25 },
                  { token: "よ",   prob: 0.15 },
                  { token: "。",   prob: 0.10 },
                  { token: "から", prob: 0.05 }
                ],
                chosen: "な"
              }
            ],
            "ドーナツ": [
              {
                context: "コーヒーに合うのはドーナツ",
                candidates: [
                  { token: "も",     prob: 0.40 },
                  { token: "だ",     prob: 0.25 },
                  { token: "です",   prob: 0.15 },
                  { token: "かな",   prob: 0.12 },
                  { token: "。",     prob: 0.08 }
                ],
                chosen: "も"
              },
              {
                context: "コーヒーに合うのはドーナツも",
                candidates: [
                  { token: "いい",       prob: 0.55 },
                  { token: "美味しい",   prob: 0.20 },
                  { token: "好き",       prob: 0.15 },
                  { token: "アリ",       prob: 0.07 },
                  { token: "候補",       prob: 0.03 }
                ],
                chosen: "いい"
              },
              {
                context: "コーヒーに合うのはドーナツもいい",
                candidates: [
                  { token: "よね",   prob: 0.50 },
                  { token: "ね",     prob: 0.25 },
                  { token: "。",     prob: 0.15 },
                  { token: "な",     prob: 0.07 },
                  { token: "かも",   prob: 0.03 }
                ],
                chosen: "よね"
              }
            ],
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
          chosen: "一番",
          branches: {
            "最も": [
              {
                context: "富士山は日本で最も",
                candidates: [
                  { token: "美しい",   prob: 0.30 },
                  { token: "高い",     prob: 0.30 },
                  { token: "有名な",   prob: 0.20 },
                  { token: "大きな",   prob: 0.12 },
                  { token: "古い",     prob: 0.08 }
                ],
                chosen: "美しい"
              },
              {
                context: "富士山は日本で最も美しい",
                candidates: [
                  { token: "山",     prob: 0.60 },
                  { token: "名峰",   prob: 0.15 },
                  { token: "火山",   prob: 0.10 },
                  { token: "場所",   prob: 0.10 },
                  { token: "景色",   prob: 0.05 }
                ],
                chosen: "山"
              },
              {
                context: "富士山は日本で最も美しい山",
                candidates: [
                  { token: "です",     prob: 0.55 },
                  { token: "だ",       prob: 0.20 },
                  { token: "。",       prob: 0.15 },
                  { token: "ですよ",   prob: 0.07 },
                  { token: "ね",       prob: 0.03 }
                ],
                chosen: "です"
              },
              {
                context: "富士山は日本で最も美しい山です",
                candidates: [
                  { token: "。",   prob: 0.65 },
                  { token: "ね",   prob: 0.15 },
                  { token: "よ",   prob: 0.10 },
                  { token: "から", prob: 0.07 },
                  { token: "が",   prob: 0.03 }
                ],
                chosen: "。"
              }
            ],
            "最高": [
              {
                context: "富士山は日本で最高",
                candidates: [
                  { token: "の", prob: 0.50 },
                  { token: "に", prob: 0.25 },
                  { token: "だ", prob: 0.15 },
                  { token: "な", prob: 0.07 },
                  { token: "、", prob: 0.03 }
                ],
                chosen: "の"
              },
              {
                context: "富士山は日本で最高の",
                candidates: [
                  { token: "山",         prob: 0.55 },
                  { token: "名峰",       prob: 0.15 },
                  { token: "風景",       prob: 0.15 },
                  { token: "場所",       prob: 0.10 },
                  { token: "シンボル",   prob: 0.05 }
                ],
                chosen: "山"
              },
              {
                context: "富士山は日本で最高の山",
                candidates: [
                  { token: "です",     prob: 0.55 },
                  { token: "だ",       prob: 0.25 },
                  { token: "。",       prob: 0.10 },
                  { token: "ですよ",   prob: 0.07 },
                  { token: "ね",       prob: 0.03 }
                ],
                chosen: "です"
              }
            ],
            "二番目": [
              {
                context: "富士山は日本で二番目",
                candidates: [
                  { token: "に", prob: 0.65 },
                  { token: "の", prob: 0.15 },
                  { token: "で", prob: 0.10 },
                  { token: "だ", prob: 0.07 },
                  { token: "ね", prob: 0.03 }
                ],
                chosen: "に"
              },
              {
                context: "富士山は日本で二番目に",
                candidates: [
                  { token: "高い",     prob: 0.55 },
                  { token: "大きい",   prob: 0.20 },
                  { token: "美しい",   prob: 0.10 },
                  { token: "有名な",   prob: 0.10 },
                  { token: "古い",     prob: 0.05 }
                ],
                chosen: "高い"
              },
              {
                context: "富士山は日本で二番目に高い",
                candidates: [
                  { token: "山",       prob: 0.70 },
                  { token: "火山",     prob: 0.10 },
                  { token: "名峰",     prob: 0.10 },
                  { token: "場所",     prob: 0.07 },
                  { token: "ところ",   prob: 0.03 }
                ],
                chosen: "山"
              },
              {
                context: "富士山は日本で二番目に高い山",
                candidates: [
                  { token: "ではない", prob: 0.40 },
                  { token: "です",     prob: 0.30 },
                  { token: "だ",       prob: 0.15 },
                  { token: "。",       prob: 0.10 },
                  { token: "ね",       prob: 0.05 }
                ],
                chosen: "ではない"
              },
              {
                context: "富士山は日本で二番目に高い山ではない",
                candidates: [
                  { token: "。",   prob: 0.55 },
                  { token: "よ",   prob: 0.20 },
                  { token: "、",   prob: 0.10 },
                  { token: "から", prob: 0.10 },
                  { token: "ね",   prob: 0.05 }
                ],
                chosen: "。"
              }
            ],
            "三番目": [
              {
                context: "富士山は日本で三番目",
                candidates: [
                  { token: "に", prob: 0.60 },
                  { token: "の", prob: 0.20 },
                  { token: "だ", prob: 0.10 },
                  { token: "な", prob: 0.07 },
                  { token: "、", prob: 0.03 }
                ],
                chosen: "に"
              },
              {
                context: "富士山は日本で三番目に",
                candidates: [
                  { token: "古い",     prob: 0.30 },
                  { token: "大きな",   prob: 0.25 },
                  { token: "高い",     prob: 0.20 },
                  { token: "有名な",   prob: 0.15 },
                  { token: "美しい",   prob: 0.10 }
                ],
                chosen: "古い"
              },
              {
                context: "富士山は日本で三番目に古い",
                candidates: [
                  { token: "火山",   prob: 0.55 },
                  { token: "山",     prob: 0.25 },
                  { token: "名峰",   prob: 0.10 },
                  { token: "場所",   prob: 0.07 },
                  { token: "名所",   prob: 0.03 }
                ],
                chosen: "火山"
              },
              {
                context: "富士山は日本で三番目に古い火山",
                candidates: [
                  { token: "です",         prob: 0.55 },
                  { token: "だ",           prob: 0.25 },
                  { token: "。",           prob: 0.10 },
                  { token: "らしい",       prob: 0.07 },
                  { token: "とのこと",     prob: 0.03 }
                ],
                chosen: "です"
              }
            ]
          }
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
          chosen: "星",
          branches: {
            "月": [
              {
                context: "夜空に月",
                candidates: [
                  { token: "が", prob: 0.55 },
                  { token: "の", prob: 0.20 },
                  { token: "と", prob: 0.10 },
                  { token: "は", prob: 0.10 },
                  { token: "を", prob: 0.05 }
                ],
                chosen: "が"
              },
              {
                context: "夜空に月が",
                candidates: [
                  { token: "浮かんで",   prob: 0.35 },
                  { token: "出て",       prob: 0.25 },
                  { token: "かかって",   prob: 0.20 },
                  { token: "光って",     prob: 0.15 },
                  { token: "見える",     prob: 0.05 }
                ],
                chosen: "浮かんで"
              },
              {
                context: "夜空に月が浮かんで",
                candidates: [
                  { token: "いる",     prob: 0.55 },
                  { token: "いた",     prob: 0.20 },
                  { token: "いました", prob: 0.15 },
                  { token: "る",       prob: 0.07 },
                  { token: "。",       prob: 0.03 }
                ],
                chosen: "いる"
              }
            ],
            "光": [
              {
                context: "夜空に光",
                candidates: [
                  { token: "が",   prob: 0.55 },
                  { token: "の",   prob: 0.20 },
                  { token: "は",   prob: 0.10 },
                  { token: "を",   prob: 0.10 },
                  { token: "たち", prob: 0.05 }
                ],
                chosen: "が"
              },
              {
                context: "夜空に光が",
                candidates: [
                  { token: "流れた",   prob: 0.30 },
                  { token: "走った",   prob: 0.25 },
                  { token: "瞬いた",   prob: 0.20 },
                  { token: "灯った",   prob: 0.15 },
                  { token: "消えた",   prob: 0.10 }
                ],
                chosen: "流れた"
              }
            ],
            "雲": [
              {
                context: "夜空に雲",
                candidates: [
                  { token: "が",   prob: 0.55 },
                  { token: "の",   prob: 0.20 },
                  { token: "は",   prob: 0.10 },
                  { token: "たち", prob: 0.10 },
                  { token: "を",   prob: 0.05 }
                ],
                chosen: "が"
              },
              {
                context: "夜空に雲が",
                candidates: [
                  { token: "流れて",   prob: 0.35 },
                  { token: "浮かんで", prob: 0.25 },
                  { token: "広がって", prob: 0.20 },
                  { token: "漂って",   prob: 0.15 },
                  { token: "かかって", prob: 0.05 }
                ],
                chosen: "流れて"
              },
              {
                context: "夜空に雲が流れて",
                candidates: [
                  { token: "いく",       prob: 0.45 },
                  { token: "いる",       prob: 0.30 },
                  { token: "いた",       prob: 0.15 },
                  { token: "いました",   prob: 0.07 },
                  { token: "行く",       prob: 0.03 }
                ],
                chosen: "いく"
              }
            ],
            "風": [
              {
                context: "夜空に風",
                candidates: [
                  { token: "が",   prob: 0.55 },
                  { token: "の",   prob: 0.20 },
                  { token: "は",   prob: 0.10 },
                  { token: "を",   prob: 0.10 },
                  { token: "たち", prob: 0.05 }
                ],
                chosen: "が"
              },
              {
                context: "夜空に風が",
                candidates: [
                  { token: "そっと",     prob: 0.30 },
                  { token: "静かに",     prob: 0.25 },
                  { token: "さらりと",   prob: 0.20 },
                  { token: "吹いて",     prob: 0.15 },
                  { token: "流れて",     prob: 0.10 }
                ],
                chosen: "そっと"
              },
              {
                context: "夜空に風がそっと",
                candidates: [
                  { token: "吹いて",   prob: 0.55 },
                  { token: "流れて",   prob: 0.20 },
                  { token: "触れて",   prob: 0.15 },
                  { token: "通って",   prob: 0.07 },
                  { token: "渡って",   prob: 0.03 }
                ],
                chosen: "吹いて"
              },
              {
                context: "夜空に風がそっと吹いて",
                candidates: [
                  { token: "いる",     prob: 0.55 },
                  { token: "いた",     prob: 0.20 },
                  { token: "いました", prob: 0.15 },
                  { token: "る",       prob: 0.07 },
                  { token: "。",       prob: 0.03 }
                ],
                chosen: "いる"
              }
            ]
          }
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
          chosen: "早く",
          branches: {
            "早起き": [
              {
                context: "明日の朝は早起き",
                candidates: [
                  { token: "しよう", prob: 0.55 },
                  { token: "する",   prob: 0.20 },
                  { token: "したい", prob: 0.12 },
                  { token: "だ",     prob: 0.08 },
                  { token: "の",     prob: 0.05 }
                ],
                chosen: "しよう"
              }
            ],
            "パン": [
              {
                context: "明日の朝はパン",
                candidates: [
                  { token: "を", prob: 0.50 },
                  { token: "が", prob: 0.25 },
                  { token: "と", prob: 0.10 },
                  { token: "で", prob: 0.10 },
                  { token: "の", prob: 0.05 }
                ],
                chosen: "を"
              },
              {
                context: "明日の朝はパンを",
                candidates: [
                  { token: "焼こう",     prob: 0.40 },
                  { token: "食べよう",   prob: 0.30 },
                  { token: "買おう",     prob: 0.15 },
                  { token: "用意",       prob: 0.10 },
                  { token: "焼く",       prob: 0.05 }
                ],
                chosen: "焼こう"
              }
            ],
            "コーヒー": [
              {
                context: "明日の朝はコーヒー",
                candidates: [
                  { token: "を",   prob: 0.50 },
                  { token: "が",   prob: 0.25 },
                  { token: "と",   prob: 0.10 },
                  { token: "から", prob: 0.10 },
                  { token: "で",   prob: 0.05 }
                ],
                chosen: "を"
              },
              {
                context: "明日の朝はコーヒーを",
                candidates: [
                  { token: "淹れよう",   prob: 0.40 },
                  { token: "飲もう",     prob: 0.30 },
                  { token: "買おう",     prob: 0.15 },
                  { token: "用意",       prob: 0.10 },
                  { token: "入れよう",   prob: 0.05 }
                ],
                chosen: "淹れよう"
              }
            ],
            "ヨガ": [
              {
                context: "明日の朝はヨガ",
                candidates: [
                  { token: "を", prob: 0.50 },
                  { token: "が", prob: 0.25 },
                  { token: "で", prob: 0.10 },
                  { token: "だ", prob: 0.10 },
                  { token: "の", prob: 0.05 }
                ],
                chosen: "を"
              },
              {
                context: "明日の朝はヨガを",
                candidates: [
                  { token: "やろう",       prob: 0.40 },
                  { token: "しよう",       prob: 0.30 },
                  { token: "やる",         prob: 0.15 },
                  { token: "始めよう",     prob: 0.10 },
                  { token: "行こう",       prob: 0.05 }
                ],
                chosen: "やろう"
              }
            ]
          }
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
          chosen: "走る",
          branches: {
            "傘": [
              {
                context: "雨の日に傘",
                candidates: [
                  { token: "を", prob: 0.50 },
                  { token: "が", prob: 0.20 },
                  { token: "は", prob: 0.15 },
                  { token: "と", prob: 0.10 },
                  { token: "も", prob: 0.05 }
                ],
                chosen: "を"
              },
              {
                context: "雨の日に傘を",
                candidates: [
                  { token: "持って",   prob: 0.45 },
                  { token: "さして",   prob: 0.25 },
                  { token: "忘れた",   prob: 0.10 },
                  { token: "買おう",   prob: 0.10 },
                  { token: "探す",     prob: 0.10 }
                ],
                chosen: "持って"
              },
              {
                context: "雨の日に傘を持って",
                candidates: [
                  { token: "出かけよう", prob: 0.40 },
                  { token: "行こう",     prob: 0.30 },
                  { token: "出よう",     prob: 0.15 },
                  { token: "散歩",       prob: 0.10 },
                  { token: "出る",       prob: 0.05 }
                ],
                chosen: "出かけよう"
              }
            ],
            "家": [
              {
                context: "雨の日に家",
                candidates: [
                  { token: "で", prob: 0.55 },
                  { token: "の", prob: 0.15 },
                  { token: "が", prob: 0.10 },
                  { token: "に", prob: 0.10 },
                  { token: "、", prob: 0.10 }
                ],
                chosen: "で"
              },
              {
                context: "雨の日に家で",
                candidates: [
                  { token: "ゆっくり", prob: 0.35 },
                  { token: "読書",     prob: 0.25 },
                  { token: "過ごそう", prob: 0.20 },
                  { token: "寝よう",   prob: 0.15 },
                  { token: "映画",     prob: 0.05 }
                ],
                chosen: "ゆっくり"
              },
              {
                context: "雨の日に家でゆっくり",
                candidates: [
                  { token: "しよう", prob: 0.50 },
                  { token: "する",   prob: 0.25 },
                  { token: "したい", prob: 0.15 },
                  { token: "過ごす", prob: 0.07 },
                  { token: "休む",   prob: 0.03 }
                ],
                chosen: "しよう"
              }
            ],
            "カフェ": [
              {
                context: "雨の日にカフェ",
                candidates: [
                  { token: "で", prob: 0.55 },
                  { token: "に", prob: 0.20 },
                  { token: "が", prob: 0.10 },
                  { token: "の", prob: 0.10 },
                  { token: "へ", prob: 0.05 }
                ],
                chosen: "で"
              },
              {
                context: "雨の日にカフェで",
                candidates: [
                  { token: "本",       prob: 0.35 },
                  { token: "読書",     prob: 0.25 },
                  { token: "コーヒー", prob: 0.20 },
                  { token: "時間",     prob: 0.15 },
                  { token: "仕事",     prob: 0.05 }
                ],
                chosen: "本"
              },
              {
                context: "雨の日にカフェで本",
                candidates: [
                  { token: "を",     prob: 0.65 },
                  { token: "が",     prob: 0.15 },
                  { token: "の",     prob: 0.10 },
                  { token: "と",     prob: 0.07 },
                  { token: "でも",   prob: 0.03 }
                ],
                chosen: "を"
              },
              {
                context: "雨の日にカフェで本を",
                candidates: [
                  { token: "読もう", prob: 0.55 },
                  { token: "読む",   prob: 0.20 },
                  { token: "読み",   prob: 0.10 },
                  { token: "読んで", prob: 0.10 },
                  { token: "開こう", prob: 0.05 }
                ],
                chosen: "読もう"
              }
            ],
            "読書": [
              {
                context: "雨の日に読書",
                candidates: [
                  { token: "が",   prob: 0.50 },
                  { token: "は",   prob: 0.20 },
                  { token: "を",   prob: 0.10 },
                  { token: "でも", prob: 0.10 },
                  { token: "の",   prob: 0.10 }
                ],
                chosen: "が"
              },
              {
                context: "雨の日に読書が",
                candidates: [
                  { token: "一番",       prob: 0.45 },
                  { token: "はかどる",   prob: 0.25 },
                  { token: "いい",       prob: 0.15 },
                  { token: "楽しい",     prob: 0.10 },
                  { token: "最高",       prob: 0.05 }
                ],
                chosen: "一番"
              },
              {
                context: "雨の日に読書が一番",
                candidates: [
                  { token: "だ",     prob: 0.45 },
                  { token: "。",     prob: 0.25 },
                  { token: "だね",   prob: 0.15 },
                  { token: "の",     prob: 0.08 },
                  { token: "いい",   prob: 0.07 }
                ],
                chosen: "だ"
              }
            ]
          }
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
