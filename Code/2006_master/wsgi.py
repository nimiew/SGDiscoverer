from main import app as application

application.secret_key = 'mysecret'
if __name__ == "__main__":
    application.run()
