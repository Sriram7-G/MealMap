
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

        stage('Install Test Dependencies') {
            steps {
                dir('tests') {
                    bat 'npm ci'
                }
            }
        }

        stage('Run Automated Tests') {
            steps {
                dir('tests') {
                    bat 'npm test'
                }
            }
        }
    }

    post {
        always {
            junit(
                testResults: 'tests/test-results.xml',
                allowEmptyResults: true
            )
        }

        success {
            echo 'MealMap Jenkins build completed successfully!'
        }

        failure {
            echo 'MealMap Jenkins build failed.'
        }
    }
}
