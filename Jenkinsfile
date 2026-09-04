pipeline {
    agent any

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Backend Dependencies') {
            steps {
                dir('backend') {
                    bat 'npm install'
                }
            }
        }

        stage('Check Frontend') {
            steps {
                bat 'if exist frontend (echo Frontend folder found) else (exit /b 1)'
            }
        }

        stage('Check Backend') {
            steps {
                bat 'if exist backend\\server.js (echo Backend server found) else (exit /b 1)'
            }
        }
    }

    post {
        success {
            echo 'MealMap Jenkins build completed successfully!'
        }

        failure {
            echo 'MealMap Jenkins build failed.'
        }
    }
}