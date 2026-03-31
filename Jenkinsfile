pipeline {
  agent any
  environment {
    IMAGE_NAME = 'spam-detector'
  }
  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }
    stage('Install dependencies') {
      steps {
        script {
          if (isUnix()) {
            sh 'python -m pip install --upgrade pip'
            sh 'python -m pip install -r requirements.txt pytest'
          } else {
            bat 'python -m pip install --upgrade pip'
            bat 'python -m pip install -r requirements.txt pytest'
          }
        }
      }
    }
    stage('Test') {
      steps {
        script {
          if (isUnix()) {
            sh 'pytest'
          } else {
            bat 'pytest'
          }
        }
      }
    }
    stage('Docker Build') {
      steps {
        script {
          if (isUnix()) {
            sh "docker build -t ${IMAGE_NAME} ."
          } else {
            bat "docker build -t %IMAGE_NAME% ."
          }
        }
      }
    }
  }
  post {
    always {
      archiveArtifacts artifacts: '**/*', fingerprint: true
    }
  }
}
