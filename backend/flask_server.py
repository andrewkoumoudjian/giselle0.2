from flask import Flask, jsonify

app = Flask(__name__)

@app.route('/health')
def health():
    return jsonify({
        'status': 'ok',
        'message': 'Flask server is running'
    })

@app.route('/test')
def test():
    return jsonify({
        'message': 'This is a test endpoint from the Flask API'
    })

if __name__ == '__main__':
    print("Starting Flask server on http://localhost:8080")
    app.run(host='0.0.0.0', port=8080, debug=True) 