(() => {
  "use strict";
  const { $, element, status } = Mini;
  const quizQuestions = [
    {
      question: "What is the capital of France?",
      answers: [
        { text: "London", correct: false },
        { text: "Berlin", correct: false },
        { text: "Paris", correct: true },
        { text: "Madrid", correct: false },
      ],
    },
    {
      question: "Which planet is known as the Red Planet?",
      answers: [
        { text: "Venus", correct: false },
        { text: "Mars", correct: true },
        { text: "Jupiter", correct: false },
        { text: "Saturn", correct: false },
      ],
    },
    {
      question: "What is the largest ocean on Earth?",
      answers: [
        { text: "Atlantic Ocean", correct: false },
        { text: "Indian Ocean", correct: false },
        { text: "Arctic Ocean", correct: false },
        { text: "Pacific Ocean", correct: true },
      ],
    },
    {
      question: "Which of these is NOT a programming language?",
      answers: [
        { text: "Java", correct: false },
        { text: "Python", correct: false },
        { text: "Banana", correct: true },
        { text: "JavaScript", correct: false },
      ],
    },
    {
      question: "What is the chemical symbol for gold?",
      answers: [
        { text: "Go", correct: false },
        { text: "Gd", correct: false },
        { text: "Au", correct: true },
        { text: "Ag", correct: false },
      ],
    },
  ];
  let index = 0,
    score = 0,
    answered = false;
  function show() {
    answered = false;
    $("next").hidden = true;
    $("feedback").textContent = "";
    $("position").textContent =
      "Question " + (index + 1) + " of " + quizQuestions.length;
    $("question").textContent = quizQuestions[index].question;
    $("progress").style.width = (index / quizQuestions.length) * 100 + "%";
    $("answers").replaceChildren(
      ...quizQuestions[index].answers.map((answer) => {
        const button = element("button", answer.text);
        button.addEventListener("click", () => {
          if (answered) return;
          answered = true;
          if (answer.correct) score++;
          for (const child of $("answers").children) child.disabled = true;
          $("feedback").textContent = answer.correct
            ? "Correct!"
            : "The correct answer is " +
              quizQuestions[index].answers.find((a) => a.correct).text +
              ".";
          $("next").hidden = false;
          $("next").textContent =
            index === quizQuestions.length - 1
              ? "See results"
              : "Next question";
          $("progress").style.width =
            ((index + 1) / quizQuestions.length) * 100 + "%";
        });
        return button;
      }),
    );
    $("question").focus();
  }
  function start() {
    index = 0;
    score = 0;
    $("start").hidden = true;
    $("result").hidden = true;
    $("quiz").hidden = false;
    show();
  }
  $("start").addEventListener("click", start);
  $("reset").addEventListener("click", start);
  $("next").addEventListener("click", () => {
    if (!answered) return;
    index++;
    if (index === quizQuestions.length) {
      $("quiz").hidden = true;
      $("result").hidden = false;
      $("score").textContent = score + " / " + quizQuestions.length;
      status(
        score === quizQuestions.length
          ? "All correct! Try another round."
          : "Round complete. Restart to practice again.",
      );
      $("reset").focus();
    } else show();
  });
})();
