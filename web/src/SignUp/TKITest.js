import React, { useState, useRef, useEffect, createRef , useMemo } from 'react';
import './TKITest.css';
import { useNavigate } from 'react-router-dom';

const TKITest = () => {
    const [answers, setAnswers] = useState({});
    const navigate = useNavigate();
    const questionRefs = useRef([]);
    const [error, setError] = useState('');
    const userId = localStorage.getItem("userId");
    const commonQuestionText = '請選出較適合你的敘述？';
    const questions = useMemo(() => [
        {
          id: 1,
          options: {
            A: "有時我會讓其他人承擔解決問題的責任。",
            B: "與其討論我們意見不合的事情，我傾向強調我們雙方都同意的事情。"
          }
        },
        {
          id: 2,
          options: {
            A: "我試圖找到一個妥協的解決方案。",
            B: "我試著處理他/她和我關心的所有問題。"
          }
        },
        {
            id: 3,
            options: {
              A: "我通常在追求我的目標時持堅定的態度。",
              B: "我可能會試著安撫對方的情感，保持我們的關係。"
            }
        },
        {
            id: 4,
            options: {
              A: "我通常在追求自己的目標時堅定不移。",
              B: "我有時會為了他人的願望而犧牲自己的願望。"
            }
        },
        {
            id: 5,
            options: {
              A: "我持續尋求對方在解決問題上的幫助。",
              B: "我試圖做必要的事情來避免無用的緊張氛圍。"
            }
        },
        {
            id: 6,
            options: {
              A: "我試圖避免給自己帶來不愉快。",
              B: "我試圖贏得我的立場。"
            }
        },
        {
            id: 7,
            options: {
              A: "我傾向於延遲問題，直到我有足夠的時間仔細思考。",
              B: "我願意放棄一些立場以換取其他立場。"
            }
        },
        {
            id: 8,
            options: {
              A: "我通常在追求自己的目標時堅定不移。",
              B: "我試圖立即公開所有關注和問題。"
            }
        },
        {
            id: 9,
            options: {
              A: "我覺得有時候不值得太過擔心差異的存在。",
              B: "我會努力按照自己的方式行事。"
            }
        },
        {
            id: 10,
            options: {
              A: "我在追求自己的目標時堅定不移。",
              B: "我試圖找到一個妥協的解決方案。"
            }
        },
        {
            id: 11,
            options: {
              A: "我試圖立即公開所有關注和問題。",
              B: "我可能會試著安撫對方的情感，保持我們的關係。"
            }
        },
        {
            id: 12,
            options: {
              A: "我有時會避免採取可能引起爭議的立場。",
              B: "如果對方讓我獲得一些立場，我也會讓對方獲得一些立場。"
            }
        },
        {
            id: 13,
            options: {
              A: "我會提議一個折衷方案。",
              B: "我會努力使我的觀點被接受。"
            }
        },
        {
            id: 14,
            options: {
              A: "我會告訴對方我的想法，並請求他/她的意見。",
              B: "我試圖向對方展示我的立場的邏輯和好處。"
            }
        },
        {
            id: 15,
            options: {
              A: "我可能會試著撫慰對方的情感，並保持我們的關係。",
              B: "我試圖做必要的事情來避免緊張氛圍。"
            }
        },
        {
            id: 16,
            options: {
              A: "我試圖不傷害對方的感受。",
              B: "我試圖說服對方我立場的優點。"
            }
        },
        {
            id: 17,
            options: {
              A: "我通常在追求自己的目標時堅定不移。",
              B: "我試圖做必要的事情來避免無謂的緊張。"
            }
        },
        {
            id: 18,
            options: {
              A: "如果這讓其他人開心，我可能會讓他們保持他們的觀點。",
              B: "我可能會允許他們保持他們的觀點，但同樣我也會保留一些我自己的觀點。"
            }
        },
        {
            id: 19,
            options: {
              A: "我試圖立即公開所有關注和問題。",
              B: "我傾向於延遲問題，直到我有足夠的時間仔細思考。"
            }
        },
        {
            id: 20,
            options: {
              A: "我試圖立即處理我們之間的分歧。",
              B: "我試圖找到一個公平的利益組合，使我們雙方都有所得失。"
            }
        },
        {
            id: 21,
            options: {
              A: "在談判中，我試圖考慮對方的願望。",
              B: "我總是傾向於直接討論問題。"
            }
        },
        {
            id: 22,
            options: {
              A: "我試圖找到一個介於他/她和我的立場之間的位置。",
              B: "我會堅持我期望的事情。"
            }
        },
        {
            id: 23,
            options: {
              A: "我經常關心滿足我們雙方的願望。",
              B: "有時我會讓其他人負責解決問題。"
            }
        },
        {
            id: 24,
            options: {
              A: "如果對方的立場對他/她非常重要，我會試著滿足他/她的願望。",
              B: "我試圖讓對方接受妥協。"
            }
        },
        {
            id: 25,
            options: {
              A: "我試圖向對方展示我的立場的邏輯和好處。",
              B: "在談判中，我試圖考慮對方的願望。"
            }
        },
        {
            id: 26,
            options: {
              A: "我會提議一個折衷方案。",
              B: "我通常非常關心滿足我們雙方的願望。"
            }
        },
        {
            id: 27,
            options: {
              A: "有時我會避免採取可能引起爭議的立場。",
              B: "如果這讓其他人開心，我可能會讓他們保持他們的觀點。"
            }
        },
        {
            id: 28,
            options: {
              A: "我通常在追求自己的目標時堅定不移。",
              B: "我通常尋求對方在解決問題上的幫助。"
            }
        },
        {
            id: 29,
            options: {
              A: "我會提議一個折衷方案。",
              B: "我覺得有時候不值得太過擔心差異的存在。"
            }
        },
        {
            id: 30,
            options: {
              A: "我試圖不傷害對方的感受。",
              B: "我總是與對方分享問題，以便我們能夠解決它。"
            }
        }       
      ],[]);
    const handleOptionChange = (questionId, option) => {
      setAnswers({ ...answers, [questionId]: option });
      if (error) setError(''); // Clear the error message if the user starts answering again
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        const unansweredQuestions = questions.some(question => !answers[question.id]);

        if (unansweredQuestions) {
            setError('尚有問題未答，請完成所有問題。');
            console.log("尚有問題漏填");
        } else {
            setError('');
            const transformedQuestions = questions.map(question => ({
                id: question.id,
                answer: answers[question.id]
            }));
            try {
                const result = await submitQuestions(transformedQuestions);
                console.log("Server response:", result);
                navigate('/rating'); 
            } catch (error) {
                setError('提交問题時出錯，請稍後再試！');
            }
        }
    };

    useEffect(() => {
        // 创建足够的ref来引用每个问题的容器
        questionRefs.current = questions.map(
          (_, i) => questionRefs.current[i] ?? createRef()
        );
      }, [questions]);
    
    async function submitQuestions(transformedQuestions) {
        try {
          const response = await fetch(`http://172.20.10.11:8080/api/users/TKIquestions/${userId}`, {
            method: 'PUT', // 或 'PUT' 根据后端需求
            headers: {
              'Content-Type': 'application/json',
            },
            
            body: JSON.stringify(transformedQuestions)
          });
          console.log(transformedQuestions);

          if (response.ok) {
            console.log("Questions submitted successfully.");
          } else {
            throw new Error('Failed to submit questions');
          }
        } catch (error) {
          console.error("Error submitting questions: ", error);
        }
    }
      
      
    return (
        <div className="tki-test-container">
            <div className="tki-intro-container">
                <h2>TKI人格特質測驗(請依直覺填寫)</h2>
                <p>TKI(Thomas-Kilmann衝突模式)是一種衝突管理工具，用於評估個人在面對與解決衝突時的風格，幫助個人了解自己在衝突處理中的偏好。而本系統透過蒐集您的TKI人格特質，將更瞭解您在團體聚餐時的行為模式，並推薦給您客製化的餐廳。</p>
            </div>
            <form onSubmit={handleSubmit}>
                {questions.map(({ id, options }) => (
                    <div key={id} className="question-container" ref={el => questionRefs.current[id] = el}>
                    <p className="question-title">{id}. {commonQuestionText}</p>
                    {Object.entries(options).map(([optionKey, optionValue]) => (
                        <div key={optionKey} className="option-container">
                        <label className="option-label">
                            <input
                            type="radio"
                            name={`question_${id}`}
                            value={optionKey}
                            checked={answers[id] === optionKey}
                            required
                            onChange={() => handleOptionChange(id, optionKey)}
                            />
                            {optionKey}) {optionValue}
                        </label>
                        </div>
                    ))}
                    </div>
                ))}
                <div className="tki-submit-container">
                    {error && <div className="tki-error">{error}</div>} 
                    <button type="submit" className="tki-submit" onClick={handleSubmit}>下一步</button>
                </div>
            </form>
        </div>
        );
  };
  
  export default TKITest;
  