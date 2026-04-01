pipeline {
  agent any
  environment {
    PYTHONUNBUFFERED = '1'
  }
  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }
    stage('Install Dependencies') {
      steps {
        sh 'python -m pip install --upgrade pip'
        sh 'python -m pip install -r requirements.txt'
      }
    }
    stage('Run Tests') {
      steps {
        sh 'pytest'
      }
    }
    stage('Build Docker Image') {
      steps {
        sh 'docker build -t spam-detector:latest .'
      }
    }
  }
  post {
    always {
      cleanWs()
    }
  }
}
