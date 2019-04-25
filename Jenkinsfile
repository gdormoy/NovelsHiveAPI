pipeline {
  agent any
  stages {
    stage('Node install') {
      steps {
        sh 'npm install'
      }
    }
    stage('Docker build') {
      steps {
        script {
          docker.build("NovelsHiveAPI")
        }
      }
    }
    stage('deployment') {
      steps {
        script {
          docker.withRegistry("https://499596517866.dkr.ecr.eu-west-3.amazonaws.com/NovelsHiveAPI", "ecr:eu-west-3:aws") {
            docker.image("NovelsHiveAPI").push()
          }
        }
      }
    }
  }
}
