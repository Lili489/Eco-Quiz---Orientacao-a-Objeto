// ================= ELEMENTOS DO HTML =================
const startScreen = document.getElementById('startScreen');   // Tela inicial
const gameScreen = document.getElementById('gameScreen');    // Tela do Jogo
const startBtn = document.getElementById('startBtn');       // Botão Iniciar
const questionText = document.getElementById('questionText');    // Texto de pergunta
const answers = Array.from(document.querySelectorAll('.answer'));  // Botões de resposta
const timeLeftEl = document.getElementById('timeLeft');    // Tempo restante
const scoreValueEl = document.getElementById('scoreValue');  // Pontuação
const nextBtn = document.getElementById('nextBtn');    // Próxima pergunta
const endBtn = document.getElementById('endBtn');     // Botão encerrar  
const livesEl = document.getElementById('lives');     // Vidas (Corações)
const gameMusic = document.getElementById('gameMusic');   // Música do Jogo


// ================= CLASSE TIMER (CORRIGIDA) =================
class Timer {
  constructor(tempo, onFinish, onTick) {
    this.tempo = tempo;
    this.onFinish = onFinish;
    this.onTick = onTick;
    this.interval = null;
  }

  iniciar() {
    let t = this.tempo;
    const total = this.tempo;

    const circle = document.querySelector("#timerCircle .progress");
    const circumference = 163;

    if (circle) {
      circle.style.strokeDasharray = circumference;
      circle.style.strokeDashoffset = 0;
    }

    timeLeftEl.textContent = t;
    this.onTick(t, total);

    this.parar();

    this.interval = setInterval(() => {
      t--;

      timeLeftEl.textContent = t;
      this.onTick(t, total);

      if (circle) {
        const progress = (t / total) * circumference;
        circle.style.strokeDashoffset = circumference - progress;
      }

      if (t <= 0) {
        this.parar();
        this.onFinish();
      }
    }, 1000);
  }

  parar() {
    clearInterval(this.interval);
  }
}

// ================= CLASSE UI =================
class UI {
  static mostrarPergunta(q) {
    questionText.textContent = q.pergunta;

    answers.forEach((btn, i) => {
      btn.textContent = q.opcoes[i];
      btn.dataset.index = i;
      btn.disabled = false;
      btn.style.background = '';
    });

    nextBtn.disabled = true;
  }

  static bloquearRespostas() {
    answers.forEach(btn => btn.disabled = true);
  }

  static marcarCorreta(index) {
    answers[index].style.background = '#c8f7d0';
  }

  static marcarErrada(btn) {
    btn.style.background = '#ffd6d6';
  }

  static atualizarVidas(vidas) {
    livesEl.innerHTML = "❤️".repeat(vidas) + "🤍".repeat(3 - vidas);
  }

  static atualizarScore(score) {
    scoreValueEl.textContent = score;
  }

  static atualizarTempo(t) {
    timeLeftEl.textContent = t;
  }
}

// ================= CLASSE PRINCIPAL DO JOGO =================
class QuizGame {
  constructor(perguntas) {
    this.perguntas = perguntas;
    this.index = 0;
    this.score = 0;
    this.vidas = 3;
    this.timer = null;

    this.configurarEventos();
    UI.atualizarVidas(this.vidas);
  }

  configurarEventos() {
    startBtn.onclick = () => this.iniciar();
    nextBtn.onclick = () => this.proxima();
    endBtn.onclick = () => location.reload();

    answers.forEach(btn =>
      btn.onclick = () => this.verificarResposta(btn)
    );
  }

  iniciar() {
    startScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');

    this.index = 0;
    this.score = 0;
    this.vidas = 3;

    UI.atualizarVidas(this.vidas);
    UI.atualizarScore(this.score);

    this.embaralhar();
    this.mostrarPergunta();

    gameMusic.play().catch(() => {});
  }

  embaralhar() {
    this.perguntas.sort(() => Math.random() - 0.5);
  }

  mostrarPergunta() {
    const perguntaAtual = this.perguntas[this.index];
    UI.mostrarPergunta(perguntaAtual);

    this.timer = new Timer(
      10,
      () => this.tempoEsgotado(),
      (t) => UI.atualizarTempo(t)
    );

    this.timer.iniciar();
  }

  verificarResposta(btn) {
    this.timer.parar();
    UI.bloquearRespostas();

    const escolha = Number(btn.dataset.index);
    const correta = this.perguntas[this.index].correta;

    if (escolha === correta) {
      UI.marcarCorreta(escolha);
      UI.atualizarScore(++this.score);
    } else {
      UI.marcarErrada(btn);
      UI.marcarCorreta(correta);
      this.vidas--;
      UI.atualizarVidas(this.vidas);
      if (this.vidas <= 0) return this.derrota();
    }

    nextBtn.disabled = false;
  }

  tempoEsgotado() {
    UI.bloquearRespostas();
    UI.marcarCorreta(this.perguntas[this.index].correta);
    this.vidas--;
    UI.atualizarVidas(this.vidas);
    if (this.vidas <= 0) return this.derrota();
    nextBtn.disabled = false;
  }

  proxima() {
    if (++this.index >= this.perguntas.length) return this.vitoria();
    this.mostrarPergunta();
  }

  derrota() {
    this.fim('gameOverScreen');
  }

  vitoria() {
    document.getElementById('finalScore').textContent = this.score;
    this.fim('winScreen');
  }

  fim(id) {
    gameScreen.classList.add('hidden');
    document.getElementById(id).classList.remove('hidden');
    gameMusic.pause();
    gameMusic.currentTime = 0;
  }
}

// ================= CLASSE PERGUNTA =================
class Pergunta {
  constructor(pergunta, opcoes, correta) {
    this.pergunta = pergunta;
    this.opcoes = opcoes;
    this.correta = correta;
  }
}
                 
// ================= PERGUNTAS =========================    
const perguntas = [
  new Pergunta(
    "O que pode ser reciclado infinitas vezes?",
    ["Vidro", "Papel", "Plástico", "Metal"],
    0
  ),
  new Pergunta(
    "Qual é a principal causa do aquecimento global?",
    ["Chuva forte", "Arco-íris", "Emissão de CO₂", "Vento"],
    2
  ),
  new Pergunta(
    "O que é considerado resíduo orgânico?",
    ["Plástico", "Restos de comida", "Metal", "Vidro"],
    1
  ),
  new Pergunta(
    "Qual hábito ajuda a economizar água?",
    ["Tomar banho longo", "Lavar calçada com mangueira", "Deixar a torneira pingando", "Fechar a torneira"],
    3
  ),
  new Pergunta(
    "Qual é a função essencial da Floresta Amazônica?",
    ["Produzir carros", "Ser um deserto", "Regular o clima", "Aumentar o calor"],
    2
  ),
  new Pergunta(
    "Qual atividade polui o ar?",
    ["Queima de combustíveis fósseis", "Plantas", "Vento", "Água da chuva"],
    0
  ),
  new Pergunta(
    "Qual material demora centenas de anos para se decompor?",
    ["Papel", "Plástico", "Cascas de frutas", "Tecidos"],
    1
  ),
  new Pergunta(
    "Qual material é totalmente reciclável?",
    ["Casca de ovo", "Madeira", "Alumínio", "Lã"],
    2
  ),
  new Pergunta(
    "O que aumenta a ocorrência de eventos climáticos extremos?",
    ["Dia nublado", "Aquecimento global", "Neve", "Vento fraco"],
    1
  ),
  new Pergunta(
    "Qual é a cor da lixeira usada para plástico?",
    ["Vermelho", "Azul", "Verde", "Marrom"],
    0
  ),
  new Pergunta(
    "Qual tipo de plástico é o mais difícil de reciclar?",
    ["PET", "PEAD", "PP", "PVC"],
    3
  ),
  new Pergunta(
    "Qual gás de efeito estufa tem maior capacidade de aquecimento a curto prazo?",
    ["Dióxido de carbono (CO₂)", "Metano (CH₄)", "Vapor d’água", "Óxido nitroso (N₂O)"],
    1
  ),
  new Pergunta(
    "Por que o vidro é considerado um dos melhores materiais para reciclagem?",
    ["Porque pode ser reciclado infinitamente", "Porque não quebra", "Porque se decompõe rápido", "Porque é leve"],
    0
  ),
  new Pergunta(
    "O derretimento do permafrost libera qual gás?",
    ["Oxigênio", "Hidrogênio", "Metano (CH₄)", "Hélio"],
    2
  ),
  new Pergunta(
    "Qual componente eletrônico é mais perigoso ao ser descartado incorretamente?",
    ["Cabo USB", "Placa de plástico", "Carregador comum", "Bateria de lítio"],
    3
  )
];
 
// ========================INICIAR JOGO============================
 
const game = new QuizGame(perguntas);       
 