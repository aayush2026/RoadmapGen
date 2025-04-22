Supplementary Materials

## INTRODUCTION TO CALCULUS

Sebastian Raschka, PhD

Copyright 2016-2023 Sebastian Raschka

## Contents

| 1 Intuition                                                                            | 1 Intuition                                                                            | 1 Intuition                                                                            | 1 Intuition                                                                            | 3                     |
|----------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------|-----------------------|
| 1.1 Derivative Notations . . . . . . . . . . . . . . . . . . . . . . .                 | 1.1 Derivative Notations . . . . . . . . . . . . . . . . . . . . . . .                 | 1.1 Derivative Notations . . . . . . . . . . . . . . . . . . . . . . .                 | 1.1 Derivative Notations . . . . . . . . . . . . . . . . . . . . . . .                 | 5                     |
| 2 Derivatives of Common Functions                                                      | 2 Derivatives of Common Functions                                                      | 2 Derivatives of Common Functions                                                      | 2 Derivatives of Common Functions                                                      | 7                     |
| 3 Common Differentiation Rules The Chain Rule - Computing the Derivative of a Composi- | 3 Common Differentiation Rules The Chain Rule - Computing the Derivative of a Composi- | 3 Common Differentiation Rules The Chain Rule - Computing the Derivative of a Composi- | 3 Common Differentiation Rules The Chain Rule - Computing the Derivative of a Composi- | 8                     |
| 4 tion of Functions 9                                                                  | 4 tion of Functions 9                                                                  | 4 tion of Functions 9                                                                  | 4 tion of Functions 9                                                                  | 4 tion of Functions 9 |
|                                                                                        | 4.1                                                                                    | A Chain Rule Example . . .                                                             | . . . . . . . . . . . . . . . . . . .                                                  | 10                    |
|                                                                                        |                                                                                        | 4.1.1                                                                                  | Step 0: Organization . . . . . . . . . . . . . . . . . . .                             | 10                    |
|                                                                                        |                                                                                        | 4.1.2                                                                                  | Step 1: Derivative of the outer function . . . . . . . .                               | 11                    |
|                                                                                        |                                                                                        | 4.1.3                                                                                  | Step 2: Derivative of the inner function . . . . . . . .                               | 11                    |
|                                                                                        |                                                                                        | 4.1.4                                                                                  | Step 3: Multiplying inner and outer derivatives . . . .                                | 11                    |
| 5                                                                                      | Arbitrarily Long Function Compositions                                                 | Arbitrarily Long Function Compositions                                                 | Arbitrarily Long Function Compositions                                                 | 12                    |
| 6                                                                                      | When a Function is Not Differentiable                                                  | When a Function is Not Differentiable                                                  | When a Function is Not Differentiable                                                  | 12                    |
|                                                                                        | 6.1 ReLU Derivative in Deep Learning . . . . . . . . . . . . . . .                     | 6.1 ReLU Derivative in Deep Learning . . . . . . . . . . . . . . .                     | 6.1 ReLU Derivative in Deep Learning . . . . . . . . . . . . . . .                     | 16                    |
| 7                                                                                      | Partial Derivatives and Gradients                                                      | Partial Derivatives and Gradients                                                      | Partial Derivatives and Gradients                                                      | 17                    |
| 8                                                                                      | Second Order Partial Derivatives                                                       | Second Order Partial Derivatives                                                       | Second Order Partial Derivatives                                                       | 20                    |
| 9                                                                                      | The Multivariable Chain Rule                                                           | The Multivariable Chain Rule                                                           | The Multivariable Chain Rule                                                           | 20                    |
| 10                                                                                     | The Multivariable Chain Rule in Vector Form                                            | The Multivariable Chain Rule in Vector Form                                            | The Multivariable Chain Rule in Vector Form                                            | 21                    |
|                                                                                        | 10.1 Dot Products . . . . . . . . . . . . . . . . . . . . . . . . . . .                | 10.1 Dot Products . . . . . . . . . . . . . . . . . . . . . . . . . . .                | 10.1 Dot Products . . . . . . . . . . . . . . . . . . . . . . . . . . .                | 22                    |
| 11 The Hessian Matrix                                                                  | 11 The Hessian Matrix                                                                  | 11 The Hessian Matrix                                                                  | 11 The Hessian Matrix                                                                  |                       |
| 12 The Laplacian Operator                                                              | 12 The Laplacian Operator                                                              | 12 The Laplacian Operator                                                              | 12 The Laplacian Operator                                                              | 23                    |

Calculus is a discipline of mathematics that provides us with tools to analyze rates of change, or decay, or motion. Both Isaac Newton and Gottfried Leibniz developed the foundations of calculus independently in the 17th century. Although we recognize Gottfried and Leibniz as the founding fathers of calculus, this field, however, has a very long series of contributors, which dates back to the ancient period and includes Archimedes, Galileo, Plato, Pythagoras, just to name a few [ ? ].

In this appendix we will only concentrate on the subfield of calculus that is of most relevance to machine and deep learning: differential calculus. In simple terms, differential calculus is focused on instantaneous rates of change or computing the slope of a linear function. We will review the basic concepts of computing the derivatives of functions that take on one or more parameters. Also, we will refresh the concepts of the chain rule, a rule that we use to compute the derivatives of composite functions, which we so often deal with in machine learning.

## 1 Intuition

So, what is the derivative of a function? In simple terms, the derivative a function is a function's instantaneous rate of change . Now, let us start this section with a visual explanation, where we consider the function

<!-- formula-not-decoded -->

shown in the graph in Figure 1.

Figure 1: Graph of a linear function, f ( x ) = 2 x .

<!-- image -->

Given the linear function in Equation 1, we can interpret the 'rate of change' as the slope of this function. And to compute the slope of a function, we take an arbitrary x-axis value, say a , and plug it into this function: f ( a ). Then, we take another value on the x-axis , let us call it b = a +∆ , where a ∆ is the change between a and b . Now, to compute the slope of this linear function, we divide the change in the function's output f ( a + ∆ ) by the a change in the function's input a +∆ : a

<!-- formula-not-decoded -->

In other words, the slope is simply the fraction of the change in a and the function's output:

<!-- formula-not-decoded -->

Now, let's take this intuition, the slope of a linear function , and formulate the general definition of the derivative of a continuous function f(x) :

<!-- formula-not-decoded -->

where lim ∆ x → 0 means 'as the change in x becomes infinitely small (for instance, ∆ x approaches zero).' Since this appendix is merely a refresher rather than a comprehensive calculus resource, we have to skip over some important concepts such as Limit Theory . So, if this is the first time you encounter calculus, I recommend consulting additional resources such as 'Calculus I, II, and III' by Jerrold E. Marsden and Alan Weinstein 1 .

## 1.1 Derivative Notations

The two different notations df dx and f ′ ( x ) both refer to the derivative of a function f ( x ). The former is the 'Lagrange notation,' and the latter is called 'Leibniz notation,' respectively. In Leibniz notation, df dx is sometimes also written as d dx f ( x ), and d dx is an operator that we read as 'differentiation with respect to x.' Although the Leibniz notation looks a bit verbose at first, it plays nicely into our intuition by regarding df as a small change in the output of a function f and dx as a small change of its input x . Hence, we can interpret the ratio df dx as the slope of a point in a function graph.

Based on the linear function introduced at the beginning of this section (Equation 1), let us use the concepts introduced in this section to compute the derivative of this function from basic principles. Given the function f ( x ) = 2 x , we have

<!-- formula-not-decoded -->

so that

<!-- formula-not-decoded -->

We conclude that the derivative of f ( x ) = 2 x is simply a constant, namely f ′ ( x ) = 2.

1 http:/ /www.cds.caltech.edu/ marsden/volume/Calculus/

Applying these same principles, let us take a look at a slightly more interesting example, a quadratic function,

<!-- formula-not-decoded -->

as illustrated in Figure 2.

Figure 2: Graph of a quadratic function, f ( x ) = x 2 .

<!-- image -->

As we can see in Figure 2, this quadratic function (Equation 7) does not have a constant slope, in contrast to a linear function. Geometrically, we can interpret the derivative of a function as the slope of a tangent to a function graph at any given point. And we can approximate the slope of a tangent at a given point by a secant connecting this point to a second point that is infinitely close, which is where the lim ∆ x → 0 notation comes from. (In the case of a linear function, the tangent is equal to the secant between two points.)

Now, to compute the derivative of the quadratic function f ( x ) = x 2 , we can, again, apply the basic concepts we used earlier, using the fact that

<!-- formula-not-decoded -->

Now, computing the derivative, we get

<!-- formula-not-decoded -->

And since ∆ x approaches zero due to the limit, we arrive at f ′ ( x ) = 2 x , which is the derivative of f ( x ) = x 2 .

## 2 Derivatives of Common Functions

After we gained some intuition in the previous section, this section provides tables and lists of the basic rules for computing function derivatives for our convenience - as an exercise, readers are encouraged to apply the basic principles to derive these rules.

The following table, Table 1, in this subsection lists derivatives of commonly used functions; the intention is that we can use it as quick look-up table. As mentioned earlier, we can obtain these derivates using the basic principles we discussed at the beginning of this appendix. For instance, we just used these basic principles to compute the derivative of a linear function (Table 1, row 3) and a quadratic function (Table 1, row 4) earlier on.

Table 1: Derivatives of common functions. Function f ( x ) Derivative with respect to x

1

a

0

2 x

1

3 ax

a

4 x 2

2 x

5 x a

ax a - 1

6 a x

log( a a ) x

7 log( x )

1 /x

8 log a ( x )

1 / x ( log( a ))

9 sin( x )

cos( x )

10 cos( x )

- sin( x )

11 tan( x )

sec 2 ( x )

## 3 Common Differentiation Rules

In addition to the constant rule (Table 1, row 1) and the power rule (Table 1, row 5), the following table lists the most common differentiation rules that we often encounter in practice. Although we will not go over the derivations of these rules, it is highly recommended to memorize and practice them. Most machine learning concepts heavily rely on applications of these rules, and in the following sections, we will pay special attention to the last rule in this list, the chain rule.

Table 2: Common differentiation rules. Function Derivative

|                 | Function          | Derivative                                              |
|-----------------|-------------------|---------------------------------------------------------|
| Sum Rule        | f ( x ) + g ( x ) | f ′ ( x ) + g ′ ( x )                                   |
| Difference Rule | f ( x ) - g ( x ) | f ′ ( x ) - g ′ ( x )                                   |
| Product Rule    | f ( x ) g ( x )   | f ′ ( x ) g ( x ) + f ( x ) g ′ ( x )                   |
| Quotient Rule   | f ( x ) /g ( x )  | [ g ( x ) f ′ ( x ) - f ( x ) g ′ ( x )] / [ g ( x )] 2 |
| Reciprocal Rule | 1 /f ( x )        | - [ f ′ ( x )] / [ f ( x )] 2                           |
| Chain Rule      | f ( g ( x ))      | f ′ ( g ( x )) g ′ ( x )                                |

## 4 The Chain Rule - Computing the Derivative of a Composition of Functions

The chain rule is essential to understanding backpropagation ; thus, let us discuss it in more detail. In its essence, the chain rule is just a mental crutch that we use to differentiate composite functions, functions that are nested within each other. For example,

<!-- formula-not-decoded -->

To differentiate such a function F , we can use this chain rule , which we can break down to a three-step procedure. First, we compute the derivative of the outer function ( f ′ ) with respect to the inner function ( g ). Second, we compute the derivative of the inner function ( g ′ ) with respect to its function argument ( x ). Third, we multiply the outcome of step 1 and step 2:

<!-- formula-not-decoded -->

Since this notation may look quite daunting, let us use a more visual approach, breaking down the function F into individual steps as illustrated in Figure 3: We take the argument x , feed it to g , then, we take the outcome of g x ( ) and feed it to f .

<!-- formula-not-decoded -->

Figure 3: Visual decomposition of a function

<!-- image -->

Using the chain rule, Figure 4 illustrates how we can derive F x ( ) via two parallel steps: We compute the derivative of the inner function g (i.e., g ′ ( x )) and multiply it by the outer derivative f ′ ( g x ( )).

<!-- formula-not-decoded -->

Figure 4: Concept of the chain rule

<!-- image -->

Now, for the rest of the section, let us use the Leibniz notation, which makes these concepts easier to follow:

<!-- formula-not-decoded -->

(Remember that the equation above is equivalent to writing F ′ ( x ) = f ′ ( g x ( )) g ′ ( x ).)

## 4.1 A Chain Rule Example

Let us now walk through an application of the chain rule, working through the differentiation of the following function:

<!-- formula-not-decoded -->

## 4.1.1 Step 0: Organization

First, we identify the innermost function:

<!-- formula-not-decoded -->

Using the definition of the inner function, we can now express the outer function in terms of g x ( ):

<!-- formula-not-decoded -->

But before we start executing the chain rule, let us substitute in our definitions into the familiar framework, differentiating function f with respect to

the inner function g , multiplied by the derivative of g with respect to the function argument:

<!-- formula-not-decoded -->

which lets us arrive at

<!-- formula-not-decoded -->

## 4.1.2 Step 1: Derivative of the outer function

Now that we have set up everything nicely to apply the chain rule, let us compute the derivative of the outer function with respect to the inner function:

<!-- formula-not-decoded -->

## 4.1.3 Step 2: Derivative of the inner function

To find the derivative of the inner function with respect to x , let us rewrite g x ( ) as

<!-- formula-not-decoded -->

Then, we can use the power rule (Table 1 row 5) to arrive at

<!-- formula-not-decoded -->

## 4.1.4 Step 3: Multiplying inner and outer derivatives

Finally, we multiply the derivatives of the outer (step 1) and inner function (step 2), to get the derivative of the function f ( x ) = log( √ x ):

<!-- formula-not-decoded -->

## 5 Arbitrarily Long Function Compositions

In the previous sections, we introduced the chain rule in context of two nested functions. However, the chain rule can also be used for an arbitrarily long function composition. For example, suppose we have five different functions, f ( x , g ) ( x , h x , u x , ) ( ) ( ) and v x ( ), and let F be the function composition:

<!-- formula-not-decoded -->

Then, we compute the derivative as

<!-- formula-not-decoded -->

As we can see in Equation 23, composing multiple function is similar to the previous two-function example; here, we create a chain of derivatives of functions with respect to their inner function until we arrive at the innermost function, which we then differentiate with respect to the function parameter x .

## 6 When a Function is Not Differentiable

A function is only differentiable if the derivative exists for each value in the function's domain (for instance, at each point). Non-differentiable functions may be a bit cumbersome to deal with mathematically; however, they can still be useful in practical contexts such as deep learning. A popular example of a non-differentiable function that is widely used in deep learning is the Rectified Linear Unit (ReLU) function. The ReLU function f ( x ) is not differentiable because its derivative does not exist at x = 0, but more about that later in this section.

One criterion for the derivative to exist at a given point is continuity at that point. However, continuity is not sufficient for the derivative to exist. For the derivative to exist, we require the left-hand and the right-hand limit to exist and to be equal.

Remember that conceptually, the derivative at a given point is defined as the slope of a tangent to the function graph at that point. Or in other words, we approximate the function graph at a given point with a straight

line as shown in Figure 5. (Intuitively, we can say that a curve, when closely observed, resembles a straight line.)

Figure 5: Graph of the function f ( x ) = x 3 with a tangent line to approximate the derivative at point x = -3 (left) and the derivative at each point on the function graph (right).

<!-- image -->

Now, if there are breaks or gaps at a given point, we cannot draw a straight line or tangent approximating the function at that point, because - in intuitive terms - we would not know how to place the tangent. Other common scenarios where derivatives do not exist are sharp turns or corners in a function graph since it is not clear how to place the tangent if we compute the limit from the left or the right side. Finally, any point on a function graph that results in a vertical tangent (parallel to the vertical axis) is not differentiable - note that a vertical line is not a function due to the one-to-many mapping condition.

The reason why the derivative of sharp turns or corners (for instance, points on a function graph that are not 'smooth') does not exist is that the limit from the left and the right side are different and do not agree. To illustrate this, let us take a look at a simple example, the absolute value function shown in Figure 6.

<!-- image -->

x

Figure 6: Graph of the 'sharp turn'-containing function f ( x ) = | x |

We will now show that the derivative for f ( x ) = | x | does not exist at the sharp turn at x = 0. Recall the definition of the derivative of a continuous function f ( x ) that was introduced in Section 1:

<!-- formula-not-decoded -->

If we substitute f ( x ) by the absolute value function, | x | , we obtain

<!-- formula-not-decoded -->

Next, let us set x = 0, the point we want to evaluate the equation

<!-- formula-not-decoded -->

If the derivative f ′ (0) exists, it should not matter whether we approach the limit from the left or the right side 2 . So, let us compute the left-side limit first (here, ∆ x represents an infinitely small, negative number):

<!-- formula-not-decoded -->

As shown above, the left-hand limit evaluates to -1 because dividing a positive number be a negative number yields a negative number. We can

2 Here, 'left' and 'right' refer to the position of a number on the number line with respect to 0.

now do the same calculation by approaching the limit from the right, where ∆ x is an infinitely small, non-negative number:

<!-- formula-not-decoded -->

glyph[negationslash]

We can see that the limits are not equal (1 = -1), and because they do not agree, we have no formal notion of how to draw the tangent line to the function graph at the point x = 0. Hence, we say that the derivative of the function f ( x ) = | x | does not exist (DNE) at point x = 0:

<!-- formula-not-decoded -->

A widely-used function in deep learning applications that is not differentiable at a point 3 is the ReLU function, which was introduced at the beginning of this section. To provide another example of a non-differentiable function, we now apply the concepts of left- and right-hand limits to the piece-wise defined ReLU function (Figure 7).

Figure 7: Graph of the ReLU function.

<!-- image -->

The ReLU function is commonly defined as

<!-- formula-not-decoded -->

or

3 Coincidentally, the point where the ReLU function is not defined is also x = 0.

<!-- formula-not-decoded -->

(These two function definitions are equivalent.) If we substitute the ReLU equation into Equation 24, we then obtain

<!-- formula-not-decoded -->

Next, let us compute the left- and right-side limits. Starting from the left side, where ∆ x is an infinitely small, negative number, we get

<!-- formula-not-decoded -->

And for the right-hand limit, where ∆ x is an infinitely small, positive number, we get

<!-- formula-not-decoded -->

Again, the left- and right-hand limits are not equal at x = 0; hence, the derivative of the ReLU function at x = 0 is not defined.

For completeness' sake, the derivative of the ReLU function for x &gt; 0 is

<!-- formula-not-decoded -->

And for x &lt; 0, the ReLU derivative is

<!-- formula-not-decoded -->

To summarize, the derivative of the ReLU function is defined as follows:

<!-- formula-not-decoded -->

## 6.1 ReLU Derivative in Deep Learning

In practical deep learning applications, the ReLU derivative for x = 0 is typically set to 0, 1, or 0.5. However, it is extremely rare that x is exactly zero, which is why the decision whether we set the ReLU derivative to 0, 1, or 0.5 has little impact on the parameterization of a neural network with ReLU activation functions.

## 7 Partial Derivatives and Gradients

Throughout the previous sections, we only looked at univariate functions, functions that only take one input variable, for example, f ( x ). In this section, we will compute the derivatives of multivariable functions f ( x, y, z, ... ). Note that we still consider scalar-valued functions, which return a scalar or single value.

While the derivative of a univariate function is a scalar, the derivative of a multivariable function is a vector, the so-called gradient . We denote the derivative of a multivariable function f using the gradient symbol ∇ (pronounced 'nabla' or 'del'):

<!-- formula-not-decoded -->

As we can see, the gradient is simply a vector listing the derivatives of a function with respect to each argument of the function. In Leibniz notation, we use the symbol ∂ instead of d to distinguish partial from ordinary derivatives. The adjective 'partial' is based on the idea that a partial derivative with respect to a function argument does not tell the whole story about a function f . For instance, given a function f , the partial derivative ∂ ∂x f ( x, y ) only considers the change in f if x changes while treating y as a constant.

To illustrate the concept of partial derivatives, let us walk through a concrete example, where we will compute the gradient of the function

<!-- formula-not-decoded -->

The plot in Figure 8 shows a graph of this function for different values of x and y .

Figure 8: Graph of the function f ( x, y ) = x y 2 + . y

<!-- image -->

The subfigures shown in Figure 9 illustrate how the function looks like if we treat either x or y as a constant.

Figure 9: Graph of function f ( x, y ) = x y 2 + y when treating y (left) or x (right) as a constant.

<!-- image -->

Intuitively, we can think of the two graphs in Figure 9 as slices of the multivariable function graph shown in Figure 8. And computing the partial derivative of a multivariable function - with respect to a function's argument - means that we compute the slope of the slice of the multivariable function graph.

Now, to compute the gradient of f , we compute the two partial derivatives of that function as follows:

<!-- formula-not-decoded -->

where

<!-- formula-not-decoded -->

(via the power rule and constant rule), and

<!-- formula-not-decoded -->

So, the gradient of the function f is defined as

<!-- formula-not-decoded -->

## 8 Second Order Partial Derivatives

Let us briefly go over the notation of second order partial derivatives, since the notation may look a bit strange at first. In a nutshell, the second order partial derivative of a function is the partial derivative of the partial derivative. For instance, we write the second derivative of a function f with respect to x as

<!-- formula-not-decoded -->

For example, we compute the second partial derivative of a function f ( x, y ) = x y 2 + y as follows:

<!-- formula-not-decoded -->

Note that in the initial definition (Equation 31) and the example (Equation 32) both the first and second order partial derivatives were computed with respect to the same input argument, x . However, depending on what measurement we are interested in, the second order partial derivative can involve a different input argument. For instance, given a multivariable function with two input arguments, we can in fact compute four distinct second order partial derivatives:

<!-- formula-not-decoded -->

where, for example, ∂ 2 f ∂y∂x is defined as

<!-- formula-not-decoded -->

## 9 The Multivariable Chain Rule

In this section, we will take a look at how to apply the chain rule to functions that take multiple arguments. For instance, let us consider the following function:

<!-- formula-not-decoded -->

where g x ( ) = 3 , and x h x ( ) = x 2 . So, as it turns out, our function is a composition of two functions:

<!-- formula-not-decoded -->

Previously, in Section 4, we defined the chain rule for the univariate case as follows:

<!-- formula-not-decoded -->

To extend apply this concept to multivariable functions, we simply extend the notation above using the product rule. Hence, we can define the multivariable chain rule as follows:

<!-- formula-not-decoded -->

Applying the multivariable chain rule to our multivariable function example f ( g, h ) = g h 2 + h , let us start with the partial derivatives:

<!-- formula-not-decoded -->

and

<!-- formula-not-decoded -->

Next, we take the ordinary derivatives of the two functions g and h :

<!-- formula-not-decoded -->

<!-- formula-not-decoded -->

And finally, plugging everything into our multivariable chain rule definition, we arrive at

<!-- formula-not-decoded -->

## 10 The Multivariable Chain Rule in Vector Form

After we introduced the general concept of the multivariable chain rule, we often prefer a more compact notation in practice: the multivariable chain rule in vector form.

## 10.1 Dot Products

As we remember from the linear algebra appendix, we compute the dot product between two vectors, a and b , as follows:

<!-- formula-not-decoded -->

In vector form, we write the multivariable chain rule

<!-- formula-not-decoded -->

as follows:

<!-- formula-not-decoded -->

Here, v is a vector listing the function arguments:

<!-- formula-not-decoded -->

And the derivative ('v-prime' in Lagrange notation) is defined as follows:

<!-- formula-not-decoded -->

So, putting everything together, we have

<!-- formula-not-decoded -->

## 11 The Hessian Matrix

As mentioned earlier in Section 8 Second Order Partial Derivatives , we can compute four distinct partial derivatives for a two-variable function:

<!-- formula-not-decoded -->

The Hessian matrix is simply a matrix that packages them up:

<!-- formula-not-decoded -->

To formulate the Hessian for a multivariable function that takes n arguments,

<!-- formula-not-decoded -->

we write the Hessian as

<!-- formula-not-decoded -->

## 12 The Laplacian Operator

At its core, the Laplacian operator (∆) is an operator that takes in a function and returns another function. In particular, it is the divergence of the gradient of a function f - a kind of second order partial derivative, or 'the dircection that increases the direction most rapidly:'

<!-- formula-not-decoded -->

Remember, we compute the gradient of a function f ( g, h ) as follows:

<!-- formula-not-decoded -->

Plugging it into the definition of the Laplacian, we arrive at

<!-- formula-not-decoded -->

And in more general terms, we can define the Laplacian of a function

<!-- formula-not-decoded -->

as

<!-- formula-not-decoded -->