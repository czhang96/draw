function startHomeIntro(firstTime){
  if(firstTime){
    var intro = introJs();
      intro.setOptions({
        steps: [
          {
            intro: "Welcome to Online Pictionary. Since this is your first visit, we are going to walk you through on how to play. If at any point you get lost. The tutorial can be reopened using the 'How to Play(?)' button on the top menu."
          },
          {
            element: '.step1',
            intro: "Input your name here.",
            position: 'right'
          },
          {
            element: '.step2',
            intro: "If you know the lobby GameID, input it here and click the join game button.",
            position: 'right'
          },
          {
            element: '.step3',
            intro: 'You can also create your own lobby.',
            position: 'right'
          }
        ]
      });
      intro.start();
  }
  else{
    console.log(firstTime);
    var intro = introJs();
      intro.setOptions({
        steps: [
          {
            element: '.step1',
            intro: "Input your name here.",
            position: 'right'
          },
          {
            element: '.step2',
            intro: "If you know the lobby GameID, input it here and click the join game button.",
            position: 'right'
          },
          {
            element: '.step3',
            intro: 'You can also create your own lobby.',
            position: 'right'
          }
        ]
      });
      intro.start();
  }
}
function startGuesserIntro(){
  var intro = introJs();
    intro.setOptions({
      steps: [
        {
          intro: "You are a guesser. As a guesser, you receive 5 points for being the first person to guess the correct word. Two points if you are not the first person."
        },
        {
          element: '.guesser-step1',
          intro: "Input your guesses into the chat.",
          position: 'left'
        },
        {
          element: '.guesser-step2',
          intro: "This tells you how many letters are in the word",
          position: 'right'
        },
        {
          element: '.guesser-step3',
          intro: "This is the time remaining in the round.",
          position: 'right'
        }
      ]
    });
    intro.start();
}
function startDrawerIntro(){
  var intro = introJs();
    intro.setOptions({
      steps: [
        {
          intro: "You are a Drawer. As the drawer, you receive one point for each correct guess. You lose two points if no one guesses the correct word",
        },
        {
          element: '.drawer-step1',
          intro: "This is the word you are trying to draw",
          position: 'bottom'
        },
        {
          element: '.drawer-step2',
          intro: "You can choose from a palette of colours and different thickness",
          position: 'top'
        },
        {
          element: '.drawer-step3',
          intro: 'This is the time remaining for the current round',
          position: 'right'
        }
      ]
    });
    intro.start();
}
function startLobbyIntro(){
  var intro = introJs();
    intro.setOptions({
      steps: [
        {
          intro: "Welcome to the Game Lobby",
        },
        {
          element: '.lobby-step1',
          intro: "Here is the list of people in your lobby",
          position: 'left'
        },
        {
          element: '.lobby-step2',
          intro: "This is the lobby chat",
          position: 'left'
        }
      ]
    });
    intro.start();
}