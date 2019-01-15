=======================
Usage(development only)
=======================

Process
=======

(새로운 디렉토리 만들지 않는 경우 스킵)


새로운 디렉토리를 만들거나 디렉토리 내부에 하위 디렉토리를 생성할 경우, 


plasma-client/docs/source/conf.py의 js_source_path 리스트에 해당 디렉토리를 추가한다.


이 때, 디렉토리 하위를 recursive하게 돌지 않으므로 모든 path를 하나하나 다 적어줘야 한다...


그리고나서 conf.py가 있는 디렉토리의 rst 파일들을 잘 모방해서 새로운 rst 파일을 만들고 index.rst에 파일 이름 기입.


1. 새로운 함수, 클래스 등을 추가할 경우, JSDoc 규격에 맞게 주석을 단다.
`valid-jsdoc <https://code.i-harness.com/ko-kr/docs/eslint/rules/valid-jsdoc/>`_


2. plasma-client/docs/ 디렉토리에서 make html 명령어를 입력. 오류가 나는지 확인.


3. plasma-client/docs/build/html/index.html 파일을 브라우저에서 열어보고 확인.


4. 커밋.


Functions
=========

이름이 겹치지 않는 것이 확실할 때,

.. autoFunction:: Book(title, author)

이름이 겹치는 경우가 생길 것이 우려 될 때,

.. autoFunction:: doc_test/doc_test.Book2(title, author)


Classes
=======

.. autoClass:: TestDocNode(constructor, args)
   :members: 

.. autoattribute:: TestDocNode#str

.. autoattribute:: TestDocNode#bong
